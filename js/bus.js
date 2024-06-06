import { ppu } from './ppu/ppu.js';
import { cpu } from './cpu/cpu.js';

/**
 * A bus is used for communication between components such as CPU, Memory, and PPU.
 */
export class Bus {
  cpuRAM = new Uint8Array(2048);
  systemClockCounter = new Uint32Array(1);

  controllerState = new Uint8Array(2);        // Internal cache of controller state

  dmaPage = new Uint8Array(1);              // This together with dmaAddress form a 16-bit address on the CPU's address bus, dmaPage is the low byte
  dmaAddress = new Uint8Array(1);
  dmaData = new Uint8Array(1);            // Represents the byte of data in transit from the CPU's memory to the OAM
  dmaTransfer = false;
  dmaDummy = true;
  writes = [];                                // Contain writes made by the CPU to the APU

  // NES components
  cpu;
  ppu;
  cartridge;
  controllers = [];

  constructor(cpu, ppu) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.cpu.connectBus(this);
  }

  reset() {
    this.cartridge.reset();
    this.cpu.reset();
    this.ppu.reset();
    for (let i = 0; i < this.controllers.length; i++) {
      this.controllers[i].reset();
    }
    this.systemClockCounter[0] = 0;

    this.dmaPage[0] = 0x00;
    this.dmaAddress[0] = 0x00;
    this.dmaData[0] = 0x00;
    this.dmaDummy = true;
    this.dmaTransfer = false;
  }

  insertCartridge(cartridge) {
    this.cartridge = cartridge;
    this.ppu.connectCartridge(cartridge);
  }

  addController(controller) {
    this.controllers.push(controller);
  }

  clock() {
    this.writes = [];
    ppu.clock();
    if (this.systemClockCounter[0] % 3 === 0) {   // The CPU runs 3 times slower than the PPU so we only call its clock() function every 3 times this function is called
      if (this.dmaTransfer) {
        if (this.dmaDummy) {
          if (this.systemClockCounter[0] % 2 === 1) {
            this.dmaDummy = false;
          }
        } else {
          if (this.systemClockCounter[0] % 2 === 0) {
            this.dmaData[0] = this.read((this.dmaPage[0] << 8) | this.dmaAddress[0]);
          } else {
            this.ppu.OAM[this.dmaAddress[0]] = this.dmaData[0];
            this.dmaAddress[0]++;
            // If this wraps around, we know that 256 bytes have been written, so end the DMA transfer, and proceed as normal
            if (this.dmaAddress[0] === 0) {
              this.dmaDummy = true;
              this.dmaTransfer = false;
            }
          }
        }
      } else {
        cpu.clock();
      }
    }

    // The PPU is capable of emitting an interrupt to indicate the vertical blanking period has been entered. If it has, the irq is sent to the CPU.
    if (this.ppu.nmi) {
      this.ppu.nmi = false;
      cpu.nmi();
    }

    if (this.cartridge.getMapper().irqState()) {
      this.cartridge.getMapper().irqClear();
      cpu.irq();
    }

    this.systemClockCounter[0]++;
    return this.writes;
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range. Every 2 kilobyte is mirrored.
   */
  read(address) {
    const read = this.cartridge.readByCPU(address);
    if (read) {
      return read.data;
    } else if (address >= 0x0000 && address <= 0x1FFF) {
      return this.cpuRAM[address & 0x07FF];                // System RAM Address Range, mirrored every 2048
    } else if (address >= 0x2000 && address <= 0x3FFF) {
      return this.ppu.readRegister(address & 0x0007);          // PPU Address range, mirrored every 8
    } else if (address === 0x4015) {
      return 0x00;
    } else if (address >= 0x4016 && address <= 0x4017) {
      const data = (this.controllerState[address & 0x0001] & 0x80) > 0 ? 1 : 0;
      this.controllerState[address & 0x0001] <<= 1;      // Read out the MSB of the controller status word
      return data;
    }
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range even though there are only 2 kilobytes available. Every 2 kilobyte
   *  is mirrored.
   */
  write(address, data) {
    if (this.cartridge.writeByCPU(address, data)) {

    } else if (address >= 0x0000 && address <= 0x1FFF) {
      this.cpuRAM[address & 0x07FF] = data;                 // Using bitwise AND to mask the bottom 11 bits is the same as addr % 2048.
    } else if (address >= 0x2000 && address <= 0x3FFF) {    // PPU Address range. The PPU only has 8 primary registers and these are repeated throughout this range.
      this.ppu.writeRegister(address & 0x0007, data);          // bitwise AND operation to mask the bottom 3 bits, which is the equivalent of addr % 8.
    } else if ((address >= 0x4000 && address <= 0x4013) || address === 0x4015 || address === 0x4017) {
      this.writes.push({address: address, data: data});     // Postpone write to the APU
    } else if (address === 0x4014) {
      this.dmaPage[0] = data;
      this.dmaAddress[0] = 0x00;
      this.dmaTransfer = true;
    } else if (address >= 0x4016 && address <= 0x4017) {
      this.controllerState[address & 0x0001] = this.controllers[address & 0x0001].getActiveButton();
    }
  }
}
