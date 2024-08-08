import { ppu } from '../ppu/ppu.js';
import { cpu } from '../cpu/cpu.js';
import { DMA } from './dma.js';
import { SystemClock } from "./systemClock.js";

/**
 * A bus is used for communication between NES components such as CPU, Memory, and PPU (i.e., the communication that
 * takes place within the actual NES console). When a cartridge has been inserted into the console, the bus is used for
 * communicating with the cartridge as well.
 */
export class Bus {
  controllerState = new Uint8Array(2);        // Internal cache of controller state
  CONTROLLER_1 = 0;
  CONTROLLER_2 = 1;
  writes = [];                                // Contain writes made by the CPU to the APU
  dma = new DMA();
  systemClock = new SystemClock();

  // NES components
  cpu;
  ppu;
  cartridge;
  controllers = [];
  internalRAM = new Uint8Array(0x800);

  constructor(cpu, ppu) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.cpu.connectBus(this);
  }

  insertCartridge(cartridge) {
    this.cartridge = cartridge;
    this.ppu.connectCartridge(cartridge);
  }

  addController(controller) {
    this.controllers.push(controller);
  }

  hasController() {
    return this.controllers.length > 0;
  }

  clock() {
    this.writes = [];
    ppu.clock();
    if (this.systemClock.isTimeToClockCPU()) {
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
              this.dma.endTransfer();
            }
          }
        }
      } else {
        cpu.clock();
      }
    }

    // The PPU is capable of emitting an interrupt to indicate the vertical blanking period has been entered. If it has, the irq is sent to the CPU.
    if (this.ppu.isNMI()) {
      this.ppu.clearNMI();
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
    if (address >= 0x0000 && address <= 0x1FFF) {
      return this.internalRAM[address & 0x07FF];
    } else if (address >= 0x2000 && address <= 0x3FFF) {
      return this.ppu.readRegister(address & 0x0007);          // PPU Address range, mirrored every 8
    } else if (address === 0x4015) {
      return 0x00;
    } else if (address === 0x4016) {
      const data = (this.controllerState[this.CONTROLLER_1] & 0x80) >> 7;
      this.controllerState[this.CONTROLLER_1] <<= 1;      // Read out the MSB of the controller status word
      return data;
    } else if (address === 0x4017) {
      const data = (this.controllerState[this.CONTROLLER_2] & 0x80) >> 7;
      this.controllerState[this.CONTROLLER_2] <<= 1;      // Read out the MSB of the controller status word
      return data;
    } else if (address >= 0x6000) {
      return this.cartridge.readByCPU(address);
    }
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range even though there are only 2 kilobytes available. Every 2 kilobyte
   *  is mirrored. The CPU invokes this write(..) method.
   */
  write(address, data) {
    if (address >= 0x0000 && address <= 0x1FFF) {
      this.internalRAM[address & 0x07FF] = data;
    } else if (address >= 0x2000 && address <= 0x3FFF) {    // PPU Address range. The PPU only has 8 primary registers and these are repeated throughout this range.
      this.ppu.writeRegister(address & 0x0007, data);          // bitwise AND operation to mask the bottom 3 bits, which is the equivalent of addr % 8.
    } else if ((address >= 0x4000 && address <= 0x4013) || address === 0x4015) {
      this.writes.push({address: address, data: data});     // Postpone write to the APU
    } else if (address === 0x4014) {
      this.dma.enableTransfer(data);
    } else if (address === 0x4016) {
      if (this.controllers[this.CONTROLLER_1].getActiveButton()) {
        this.controllerState[this.CONTROLLER_1] = this.controllers[this.CONTROLLER_1].getActiveButton();
      }
      if (this.controllers[this.CONTROLLER_2].getActiveButton()) {
        this.controllerState[this.CONTROLLER_2] = this.controllers[this.CONTROLLER_2].getActiveButton();
      }
    } else if (address >= 0x6000) {
      this.cartridge.writeByCPU(address, data);
    }
  }

  /**
   *  Collect all DMC samples from memory locations $C000 - $FFFF at the startup of a game.
   */
  collectAllSamples() {
    const samples = [];
    const sampleAddress = new Uint16Array(1);
    sampleAddress[0] = 0xC000;
    while (sampleAddress[0] < 0xFFFF) {
      samples.push(this.read(sampleAddress[0]));
      sampleAddress[0]++;
    }

    return samples;
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
    this.internalRAM = new Uint8Array(2048);
  }
}
