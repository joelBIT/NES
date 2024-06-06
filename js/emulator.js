import { Bus } from './bus.js';
import { ppu } from './ppu/ppu.js';
import { cpu } from './cpu/cpu.js';
import { Cartridge } from './cartridge/cartridge.js';
import { Controller } from "./controller.js";

const bus = new Bus(cpu, ppu);
const controller = new Controller();
const controllerConfiguration = [];

self.onmessage = function(message) {
  switch (message.data.event) {
    case 'configuration':
      controllerConfiguration.length = 0;
      controllerConfiguration.push(...message.data.data);
      setControllerButtons();
      break;
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
        case controller.getA():
          controller.releaseA();
          break;
        case controller.getB():
          controller.releaseB();
          break;
        case controller.getSelect():
          controller.releaseSelect();
          break;
        case controller.getStart():
          controller.releaseStart();
          break;
        case controller.getUp():
          controller.releaseUp();
          break;
        case controller.getDown():
          controller.releaseDown();
          break;
        case controller.getLeft():
          controller.releaseLeft();
          break;
        case controller.getRight():
          controller.releaseRight();
          break;
      }
      break;
    case 'keydown':
      switch (message.data.value) {
        case controller.getA():
          controller.pressA();
          break;
        case controller.getB():
          controller.pressB();
          break;
        case controller.getSelect():
          controller.pressSelect();
          break;
        case controller.getStart():
          controller.pressStart();
          break;
        case controller.getUp():
          controller.pressUp();
          break;
        case controller.getDown():
          controller.pressDown();
          break;
        case controller.getLeft():
          controller.pressLeft();
          break;
        case controller.getRight():
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


function setControllerButtons() {
  controllerConfiguration.forEach((button) => setButton(button));
}

function setButton(button) {
  switch (button.button) {
    case 'A':
      controller.setA(button.value);
      break;
    case 'B':
      controller.setB(button.value);
      break;
    case 'Start':
      controller.setStart(button.value);
      break;
    case 'Select':
      controller.setSelect(button.value);
      break;
    case 'ArrowUp':
      controller.setUp(button.value);
      break;
    case 'ArrowDown':
      controller.setDown(button.value);
      break;
    case 'ArrowLeft':
      controller.setLeft(button.value);
      break;
    case 'ArrowRight':
      controller.setRight(button.value);
      break;
  }
}
