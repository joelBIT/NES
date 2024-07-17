'use strict';

const worker = new Worker('js/emulator.js',{ type: "module" });
let nesWorkletNode;
let audioContext;

/**
 * |******************|
 * | Initialize Audio |
 * |******************|
 */

worker.onmessage = function(message) {
  nesWorkletNode.port.postMessage(message.data);   // Send address and data to APU
};

/**
 * The control of the canvas is transferred to the NES worker thread when the page has been loaded. As a result, the
 * worker thread takes care of the graphical processing and the player can interact with the interface without noticing
 * too much lag. The Audio Context and Audio Source are also initialized when the page has loaded.
 */
window.onload = () => {
  const canvas = document.getElementById("canvas").transferControlToOffscreen();
  worker.postMessage({ canvas: canvas }, [canvas]);

  audioContext = new AudioContext();
  nesWorkletNode = audioContext.audioWorklet.addModule('js/apu-worklet.js', { credentials: "omit" }).then(() => {
    nesWorkletNode = new AudioWorkletNode(audioContext, "apu-worklet");
    nesWorkletNode.connect(audioContext.destination);
    const source = audioContext.createBufferSource();
    source.buffer = audioContext.createBuffer(2, audioContext.sampleRate, audioContext.sampleRate);
  }).catch(error => console.log(error));
};

/**
 * |*************************|
 * | Handle controller input |
 * |*************************|
 */

const keyUpEventLogger = function(event) {
  worker.postMessage({event: 'keyup', value: event.code});
};

const keyDownEventLogger = function(event) {
  worker.postMessage({event: 'keydown', value: event.code});
};

window.addEventListener("keyup", keyUpEventLogger);
window.addEventListener("keydown", keyDownEventLogger);

/**
 * |**************|
 * | Read NES ROM |
 * |**************|
 */

function readFile(event) {
  try {
    worker.postMessage({event: 'readFile', data: event.target.result});
    audioContext.resume();
  } catch (e) {
    console.log(e);
  }
}

/**
 * Performs check if file is NES ROM. If controller configuration is stored in local storage it is sent to the emulator.
 * Otherwise a default configuration is used. Then the input file is read.
 */
document.getElementById("nesfile").addEventListener('change', input => {
  if (!input.target.files.length) {
    alert('No file');
    return;
  }
  console.log(input.target.files[0]);

  if (input.target.files[0].type !== 'application/x-nes-rom') {
    document.getElementById("nesfile").value = '';
    alert('File is not a NES ROM');
    return;
  }

  const controllerConfiguration = [];
  for (const key of keys) {
    if (localStorage.getItem(key.id)) {
      controllerConfiguration.push( { button: key.id, value: localStorage.getItem(key.id) } );
    } else {
      controllerConfiguration.push( { button: key.id, value: key.value } );
    }
  }
  worker.postMessage({ event: 'configuration', data: controllerConfiguration });

  const fileReader = new FileReader();
  fileReader.addEventListener('load', readFile);
  fileReader.readAsArrayBuffer(input.target.files[0]);
});

/**
 * |**************************|
 * | Controller Configuration |
 * |**************************|
 */

const dialog = document.getElementById("dialog");
const showButton = document.querySelector(".show");
const closeButton = document.querySelector(".close");
const saveButton = document.querySelector(".save");

/**
 * Retrieve controller configuration from local storage. Use default values for buttons if configuration is not found.
 */
showButton.addEventListener("click", () => {
  for (const key of keys) {
    const button = localStorage.getItem(key.id);
    if (button) {
      key.value = button;
    } else {
      key.value = key.defaultValue;
    }
  }

  dialog.showModal();
  dialog.classList.remove('hidden');
});

/**
 * Set all buttons to default values if the modal is closed (i.e., closing without saving changes).
 */
closeButton.addEventListener("click", () => {
  dialog.close();
  for (const key of keys) {
    key.value = key.defaultValue;
    key.classList.remove('missing');
  }
  dialog.classList.add('hidden');
});

/**
 * Do not store configuration if player has left empty input fields when trying to save the controller configuration.
 * Store the controller configuration in local storage if all fields are nonempty.
 */
saveButton.addEventListener("click", (event) => {
  let missingValue = false;

  for (const key of keys) {
    if (!key.value) {
      missingValue = true;
      key.classList.add('missing');
    }
  }

  if (missingValue) {
    alert("Missing configuration");
    event.preventDefault();
    return;
  }

  for (const key of keys) {
    if (key.value) {
      localStorage.setItem(key.id, key.value);
    } else {
      localStorage.setItem(key.id, key.defaultValue);
    }
  }

  dialog.close();
  dialog.classList.add('hidden');
});

const keys = document.getElementsByClassName('key');
for (const key of keys) {
  key.addEventListener('focus', removeInputCharacter);
  key.addEventListener('focusout', addDefaultValueIfEmpty);
  key.addEventListener('keydown', setKeyCode);
  key.addEventListener('keyup', setDefaultValueIfKeyCodeMissing);
}

/**
 *  Remove the input character in order to prepare the field for the pressed key's code.
 */
function removeInputCharacter(event) {
  event.target.value = '';
}

/**
 *  If input text field is empty when focus is removed, add the button's default value instead.
 */
function addDefaultValueIfEmpty(event) {
  event.target.classList.remove('missing');
  if (!event.target.value) {
    event.target.value = event.target.defaultValue;
  }
}

/**
 *  Set default value if button has no value.
 */
function setDefaultValueIfKeyCodeMissing(event) {
  if (!event.code) {
    event.target.value = event.target.defaultValue;
  }
}

/**
 *  Show key code in input text field.
 */
function setKeyCode(event) {
  removeKeyWhereAlreadyUsed(event);
  event.target.value = event.code;
  event.preventDefault();
}

/**
 *  Removes the chosen key from other buttons if already in use.
 */
function removeKeyWhereAlreadyUsed(event) {
  const keyCode = event.code;
  for (const key of keys) {
    if (Object.is(key.value, keyCode)) {
      key.value = '';
    }
  }
}
