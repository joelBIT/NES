import { apu } from './apu.js';
import { ppu } from './ppu.js';
import { cpu } from './cpu.js';
import { Cartridge } from './cartridge.js';

/**
 *  Mirror
 */
const Mirror = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  HARDWARE: "hardware",
  ONE_SCREEN_LOW: "one screen_low",
  ONE_SCREEN_HIGH: "one screen_high"
});

/**
 * A bus is used for communication between components such as CPU, Memory, and PPU.
 */
class Bus {
  cpuRAM = new Uint8Array(2048);
  systemClockCounter = new Uint32Array(1);
  controllers = new Uint8Array(2);            // Controllers
  controllerState = new Uint8Array(2);        // Internal cache of controller state

  dmaPage = new Uint8Array(1);              // This together with dmaAddress form a 16-bit address on the CPU's address bus, dmaPage is the low byte
  dmaAddress = new Uint8Array(1);
  dmaData = new Uint8Array(1);            // Represents the byte of data in transit from the CPU's memory to the OAM
  dmaTransfer = false;
  dmaDummy = true;

  // NES components
  apu;
  cpu;
  ppu;
  cartridge;

  constructor(apu, cpu, ppu) {
    this.apu = apu;
    this.cpu = cpu;
    this.ppu = ppu;
    this.cpu.connectBus(this);
  }

  /**
   * The sound system will be running at approximately 44kHz and the NES clock is running in MHz, therefore a number of
   * NES clocks must be executed to be equivalent to 1 sound sample duration. This method informs the APU about the
   * temporal properties of the surrounding emulation system.
   */
  audioSample = 0.0;                  // The outputted audio sample (mix of the channels output samples)
  audioTime = 0.0;                    // Accumulates elapsed audio time in between system samples
  audioTimePerSystemSample = 1.0 / 44100;   // The real-time duration between samples required by the sound hardware
  audioTimePerNesClock = 1.0 / 5369318.0;       // The real-time duration that elapses during a real-time NES clock. This will be a constant describing how much artificial real-time passes per NES clock.

  reset() {
    this.cartridge.reset();
    this.cpu.reset();
    this.ppu.reset();
    this.apu.reset();
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

  clock() {
    ppu.clock();
    apu.clock();
    if (this.systemClockCounter[0] % 3 === 0) {   // The CPU runs 3 times slower than the PPU so we only call its clock() function every 3 times this function is called
      if (this.dmaTransfer) {
        if (this.dmaDummy) {
          if (this.systemClockCounter[0] % 2 === 1) {
            this.dmaDummy = false;
          }
        } else {
          if (this.systemClockCounter[0] % 2 === 0) {
            this.dmaData[0] = this.cpuRead((this.dmaPage[0] << 8) | this.dmaAddress[0]);
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

    // Synchronising with Audio
    this.audioSampleReady = false;
    this.audioTime += this.audioTimePerNesClock;
    if (this.audioTime >= this.audioTimePerSystemSample) {
      this.audioTime -= this.audioTimePerSystemSample;
      this.audioSample = this.apu.getOutputSample();
      this.audioSampleReady = true;
    }

    // The PPU is capable of emitting an interrupt to indicate the vertical blanking period has been entered. If it has, the irq is sent to the CPU.
    if (this.ppu.nmi) {
      this.ppu.nmi = false;
      cpu.nmi();
    }

    this.systemClockCounter[0]++;

    return this.audioSampleReady;
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range. Every 2 kilobyte is mirrored.
   */
  cpuRead(address) {
    const read = this.cartridge.cpuReadCart(address);
    if (read) {
      return read.data;
    } else if (address >= 0x0000 && address <= 0x1FFF) {
      return this.cpuRAM[address & 0x07FF];                // System RAM Address Range, mirrored every 2048
    } else if (address >= 0x2000 && address <= 0x3FFF) {
      return this.ppu.readByCPU(address & 0x0007);          // PPU Address range, mirrored every 8
    } else if (address === 0x4015) {
      return this.apu.readByCPU(address);
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
  cpuWrite(address, data) {
    if (this.cartridge.cpuWriteCart(address, data)) {

    } else if (address >= 0x0000 && address <= 0x1FFF) {
      this.cpuRAM[address & 0x07FF] = data;         // Using bitwise AND to mask the bottom 11 bits is the same as addr % 2048.
    } else if (address >= 0x2000 && address <= 0x3FFF) {   // PPU Address range. The PPU only has 8 primary registers and these are repeated throughout this range.
      this.ppu.writeByCPU(address & 0x0007, data);    // bitwise AND operation to mask the bottom 3 bits, which is the equivalent of addr % 8.
    } else if ((address >= 0x4000 && address <= 0x4013) || address === 0x4015 || address === 0x4017) {
      this.apu.writeByCPU(address, data);
    } else if (address === 0x4014) {
      this.dmaPage[0] = data;
      this.dmaAddress[0] = 0x00;
      this.dmaTransfer = true;
    } else if (address >= 0x4016 && address <= 0x4017) {
      this.controllerState[address & 0x0001] = this.controllers[address & 0x0001];
    }
  }
}

const bus = new Bus(apu, cpu, ppu);

let buffer = [];


self.onmessage = function(message) {
  switch (message.data.event) {
    case 'audio':
      function tick() {
        do {
          let audioSample = bus.clock();
          if (audioSample) {
            buffer[buffer.length] = bus.audioSample;
          }
          if (buffer.length >= 29780) {
            postMessage({ audioSample: buffer.splice(0, 29780) });
          }
        } while (!bus.ppu.isFrameCompleted());
          bus.ppu.frameComplete = false;
          //requestAnimationFrame(tick);
        bus.ppu.req(tick);
      }
      bus.ppu.req(tick);
      //requestAnimationFrame(tick);
      break;
    case 'infinite':
      function loop() {
        do {
          bus.clock();
        } while (!bus.ppu.isFrameCompleted());
        bus.ppu.frameComplete = false;
        requestAnimationFrame(loop);
      }
        requestAnimationFrame(loop);
      break;
    case 'readFile':
      const rom = new Uint8Array(message.data.data);
      bus.insertCartridge(new Cartridge(rom));
      bus.reset();
      break;
    case 'keyup':
      switch (message.data.value) {
        case 'KeyX':
          bus.controllers[0] &= (~(1 << 7)) & 0xff;
          break;
        case 'KeyZ':
          bus.controllers[0] &= (~(1 << 6)) & 0xff;
          break;
        case 'KeyA':
          bus.controllers[0] &= (~(1 << 5)) & 0xff;
          break;
        case 'KeyS':
          bus.controllers[0] &= (~(1 << 4)) & 0xff;
          break;
        case 'ArrowUp':
          bus.controllers[0] &= (~(1 << 3)) & 0xff;
          break;
        case 'ArrowDown':
          bus.controllers[0] &= (~(1 << 2)) & 0xff;
          break;
        case 'ArrowLeft':
          bus.controllers[0] &= (~(1 << 1)) & 0xff;
          break;
        case 'ArrowRight':
          bus.controllers[0] &= (~(1 << 0)) & 0xff;
          break;
      }
      break;
    case 'keydown':
      switch (message.data.value) {
        case 'KeyX':
          bus.controllers[0] |= 0x80;
          break;
        case 'KeyZ':
          bus.controllers[0] |= 0x40;
          break;
        case 'KeyA':
          bus.controllers[0] |= 0x20;
          break;
        case 'KeyS':
          bus.controllers[0] |= 0x10;
          break;
        case 'ArrowUp':
          bus.controllers[0] |= 0x08;
          break;
        case 'ArrowDown':
          bus.controllers[0] |= 0x04;
          break;
        case 'ArrowLeft':
          bus.controllers[0] |= 0x02;
          break;
        case 'ArrowRight':
          bus.controllers[0] |= 0x01;
          break;
      }
      break;
    default:
      break;
  }

  if (message.data.canvas) {
    ppu.setContext(message.data.canvas.getContext("2d", { willReadFrequently: true }));
  }
};


