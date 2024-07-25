import { Bus } from './bus/bus.js';
import { ppu } from './ppu/ppu.js';
import { cpu } from './cpu/cpu.js';
import { Cartridge } from './cartridge/cartridge.js';
import { Controller } from "./controller.js";

const bus = new Bus(cpu, ppu);
const controller1 = new Controller();
const controller2 = new Controller();
const controllerConfiguration = [];
let animationFrameID;

/**
 * This class is a worker thread handling the communication between the user interface and the NES. Conceptually, this
 * class can be viewed as the NES console. A player puts in a cartridge into the console, or press buttons on a
 * controller. That player interaction with the console is handled in this class. The Bus class is used for
 * communication that takes place within the actual NES console.
 *
 */
self.onmessage = function(message) {
  switch (message.data.event) {
    case 'configuration':
      controllerConfiguration.length = 0;
      controllerConfiguration.push(...message.data.data);
      setControllerButtons();
      break;
    case 'readFile':
      const rom = new Uint8Array(message.data.data);
      cancelAnimationFrame(animationFrameID);
      postMessage({address: 0x5000, data: 'reset'});      // Reset the APU
      try {
        bus.insertCartridge(new Cartridge(rom));
      } catch (e) {
        if (e === 'Not an iNES Rom') {
          alert('Not an INES file');
        }
        return;
      }

      if (!bus.hasController()) {
        bus.addController(controller1);
        bus.addController(controller2);
      }
      bus.reset();
      postMessage({address: 0x5001, data: bus.collectAllSamples()});      // Send all DMC samples to the DMC in the APU

      function tick() {
        do {
          let writes = bus.clock();
          if (writes.length > 0) {          // Check if any writes to the APU has been performed
            postMessage(writes.pop());      // If yes, post the address and data to the APU via main thread
          }
        } while (!ppu.isFrameCompleted());
        ppu.frameComplete = false;
        animationFrameID = requestAnimationFrame(tick);
      }
        requestAnimationFrame(tick);
      break;
    case 'keyup':
      keyUp(message.data.value);
      break;
    case 'keydown':
      keyDown(message.data.value);
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
      controller1.setA(button.value);
      break;
    case 'B':
      controller1.setB(button.value);
      break;
    case 'Start':
      controller1.setStart(button.value);
      break;
    case 'Select':
      controller1.setSelect(button.value);
      break;
    case 'ArrowUp':
      controller1.setUp(button.value);
      break;
    case 'ArrowDown':
      controller1.setDown(button.value);
      break;
    case 'ArrowLeft':
      controller1.setLeft(button.value);
      break;
    case 'ArrowRight':
      controller1.setRight(button.value);
      break;
    case 'A2':
      controller2.setA(button.value);
      break;
    case 'B2':
      controller2.setB(button.value);
      break;
    case 'Start2':
      controller2.setStart(button.value);
      break;
    case 'Select2':
      controller2.setSelect(button.value);
      break;
    case 'ArrowUp2':
      controller2.setUp(button.value);
      break;
    case 'ArrowDown2':
      controller2.setDown(button.value);
      break;
    case 'ArrowLeft2':
      controller2.setLeft(button.value);
      break;
    case 'ArrowRight2':
      controller2.setRight(button.value);
      break;
  }
}

function keyUp(key) {
  switch (key) {
    case controller1.getA():
      controller1.releaseA();
      break;
    case controller1.getB():
      controller1.releaseB();
      break;
    case controller1.getSelect():
      controller1.releaseSelect();
      break;
    case controller1.getStart():
      controller1.releaseStart();
      break;
    case controller1.getUp():
      controller1.releaseUp();
      break;
    case controller1.getDown():
      controller1.releaseDown();
      break;
    case controller1.getLeft():
      controller1.releaseLeft();
      break;
    case controller1.getRight():
      controller1.releaseRight();
      break;
    case controller2.getA():
      controller2.releaseA();
      break;
    case controller2.getB():
      controller2.releaseB();
      break;
    case controller2.getSelect():
      controller2.releaseSelect();
      break;
    case controller2.getStart():
      controller2.releaseStart();
      break;
    case controller2.getUp():
      controller2.releaseUp();
      break;
    case controller2.getDown():
      controller2.releaseDown();
      break;
    case controller2.getLeft():
      controller2.releaseLeft();
      break;
    case controller2.getRight():
      controller2.releaseRight();
      break;
  }
}

function keyDown(key) {
  switch (key) {
    case controller1.getA():
      controller1.pressA();
      break;
    case controller1.getB():
      controller1.pressB();
      break;
    case controller1.getSelect():
      controller1.pressSelect();
      break;
    case controller1.getStart():
      controller1.pressStart();
      break;
    case controller1.getUp():
      controller1.pressUp();
      break;
    case controller1.getDown():
      controller1.pressDown();
      break;
    case controller1.getLeft():
      controller1.pressLeft();
      break;
    case controller1.getRight():
      controller1.pressRight();
      break;
    case controller2.getA():
      controller2.pressA();
      break;
    case controller2.getB():
      controller2.pressB();
      break;
    case controller2.getSelect():
      controller2.pressSelect();
      break;
    case controller2.getStart():
      controller2.pressStart();
      break;
    case controller2.getUp():
      controller2.pressUp();
      break;
    case controller2.getDown():
      controller2.pressDown();
      break;
    case controller2.getLeft():
      controller2.pressLeft();
      break;
    case controller2.getRight():
      controller2.pressRight();
      break;
  }
}
