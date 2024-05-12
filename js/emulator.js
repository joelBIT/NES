import { Bus } from './bus.js';
import { ppu } from './ppu/ppu.js';
import { cpu } from './cpu/cpu.js';
import { Cartridge } from './cartridge/cartridge.js';

const bus = new Bus(cpu, ppu);

self.onmessage = function(message) {
  switch (message.data.event) {
    case 'readFile':
      const rom = new Uint8Array(message.data.data);
      bus.insertCartridge(new Cartridge(rom));
      bus.reset();
      function tick() {
        do {
          let writes = bus.clock();
          if (writes.length > 0) {          // Check if any writes to the APU has been performed
            postMessage(writes.pop());      // If yes, post the address and data to the APU via main thread
          }
        } while (!ppu.isFrameCompleted());
        ppu.frameComplete = false;
        requestAnimationFrame(tick);
      }
        requestAnimationFrame(tick);
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


