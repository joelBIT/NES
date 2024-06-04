import { Bus } from './bus.js';
import { ppu } from './ppu/ppu.js';
import { cpu } from './cpu/cpu.js';
import { Cartridge } from './cartridge/cartridge.js';
import { Controller } from "./controller.js";

const bus = new Bus(cpu, ppu);
const controller = new Controller();

self.onmessage = function(message) {
  switch (message.data.event) {
    case 'readFile':
      const rom = new Uint8Array(message.data.data);
      try {
        bus.insertCartridge(new Cartridge(rom));
      } catch (e) {
        if (e === 'Not an iNES Rom') {
          alert('Not an INES file');
        }
        return;
      }

      bus.addController(controller);
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
          controller.releaseA();
          break;
        case 'KeyZ':
          controller.releaseB();
          break;
        case 'KeyA':
          controller.releaseSelect();
          break;
        case 'KeyS':
          controller.releaseStart();
          break;
        case 'ArrowUp':
          controller.releaseUp();
          break;
        case 'ArrowDown':
          controller.releaseDown();
          break;
        case 'ArrowLeft':
          controller.releaseLeft();
          break;
        case 'ArrowRight':
          controller.releaseRight();
          break;
      }
      break;
    case 'keydown':
      switch (message.data.value) {
        case 'KeyX':
          controller.pressA();
          break;
        case 'KeyZ':
          controller.pressB();
          break;
        case 'KeyA':
          controller.pressSelect();
          break;
        case 'KeyS':
          controller.pressStart();
          break;
        case 'ArrowUp':
          controller.pressUp();
          break;
        case 'ArrowDown':
          controller.pressDown();
          break;
        case 'ArrowLeft':
          controller.pressLeft();
          break;
        case 'ArrowRight':
          controller.pressRight();
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


