import { ppu } from '../ppu/ppu.js';
import { cpu } from '../cpu/cpu.js';
import { DMA } from './dma.js';
import { SystemClock } from "./systemClock.js";

/**
 * A bus is used for communication between NES components such as CPU, Memory, and PPU (i.e., the communication that
 * takes place within the actual NES console). When a cartridge has been inserted into the console, the bus is used for
 * communicating with the cartridge as well.
 *
 */
export class Bus {
  controllerState = new Uint8Array(2);        // Internal cache of controller state
  writes = [];                                // Contain writes made by the CPU to the APU
  dma = new DMA();
  systemClock = new SystemClock();

  // NES components
  cpu;
  ppu;
  cartridge;
  controllers = [];
  cpuRAM = new Uint8Array(2048);

  constructor(cpu, ppu) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.cpu.connectBus(this);
  }

  reset() {
    this.cartridge.reset();
    this.cpu.reset();
    this.ppu.reset();
    this.dma.reset();
    for (let i = 0; i < this.controllers.length; i++) {
      this.controllers[i].reset();
    }
    this.systemClock.reset();
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
    if (this.systemClock.isTimeToClockPPU()) {
      if (this.dma.isTransfer()) {
        if (this.dma.isDummy()) {
          if (this.systemClock.isTimeToAllowDMA()) {
            this.dma.setDummy(false);
          }
        } else {
          if (this.systemClock.isTimeToReadBus()) {
            this.dma.setData(this.read((this.dma.getPage() << 8) | this.dma.getAddress()));
          } else {
            this.ppu.writeOAM(this.dma.getAddress(), this.dma.getData());
            this.dma.incrementAddress();
            if (this.dma.isWrapping()) {
              this.dma.setDummy(true);
              this.dma.setTransfer(false);
            }
          }
        }
      } else {
        cpu.clock();
      }
    }

    // The PPU is capable of emitting an interrupt to indicate the vertical blanking period has been entered. If it has, the irq is sent to the CPU.
    if (this.ppu.isNMI()) {
      this.ppu.setNMI(false);
      cpu.nmi();
    }

    if (this.cartridge.irqState()) {
      this.cartridge.clearIRQ();
      cpu.irq();
    }

    this.systemClock.increment();
    return this.writes;
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range. Every 2 kilobyte is mirrored. The CPU invokes this read(..) method.
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
    } else if (address === 0x4016 || address === 0x4017) {
      const data = (this.controllerState[address & 0x0001] & 0x80) > 0 ? 1 : 0;
      this.controllerState[address & 0x0001] <<= 1;      // Read out the MSB of the controller status word
      return data;
    }
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range even though there are only 2 kilobytes available. Every 2 kilobyte
   *  is mirrored. The CPU invokes this write(..) method.
   */
  write(address, data) {
    if (this.cartridge.writeByCPU(address, data)) {

    } else if (address >= 0x0000 && address <= 0x1FFF) {
      this.cpuRAM[address & 0x07FF] = data;                 // Using bitwise AND to mask the bottom 11 bits is the same as addr % 2048.
    } else if (address >= 0x2000 && address <= 0x3FFF) {    // PPU Address range. The PPU only has 8 primary registers and these are repeated throughout this range.
      this.ppu.writeRegister(address & 0x0007, data);          // bitwise AND operation to mask the bottom 3 bits, which is the equivalent of addr % 8.
    } else if ((address >= 0x4000 && address <= 0x4013) || address === 0x4015) {
      this.writes.push({address: address, data: data});     // Postpone write to the APU
    } else if (address === 0x4014) {
      this.setupDMA(data);
    } else if (address === 0x4016 || address === 0x4017) {
      this.controllerState[0] = this.controllers[0].getActiveButton();
      this.controllerState[1] = this.controllers[1].getActiveButton();
    }
  }

  /**
   * The page number (the high byte of the address) is written to OAMDMA ($4014).
   */
  setupDMA(data) {
    this.dma.setPage(data);
    this.dma.setAddress(0x00);
    this.dma.setTransfer(true);
  }
}
