'use strict';

const worker = new Worker('js/emulator.js',{ type: "module" });
let nesWorkletNode;

window.onload = e => {
  const canvas = document.getElementById("canvas").transferControlToOffscreen();
  worker.postMessage({ canvas: canvas }, [canvas]);
};

/**
 * |*************************|
 * | Handle controller input |
 * |*************************|
 */

const keyUpEventLogger = function (e) {
  worker.postMessage({event: 'keyup', value: e.code});
};

const keyDownEventLogger = function (e) {
  worker.postMessage({event: 'keydown', value: e.code});
};

window.addEventListener("keyup", keyUpEventLogger);
window.addEventListener("keydown", keyDownEventLogger);

/**
 * |******************|
 * | Initialize Audio |
 * |******************|
 */

function readFile(event) {
  const audioContext = new AudioContext();
  nesWorkletNode = audioContext.audioWorklet.addModule('js/apu-worklet.js', { credentials: "omit" }).then(() => {
    nesWorkletNode = new AudioWorkletNode(audioContext, "apu-worklet");
    nesWorkletNode.connect(audioContext.destination);
    const source = audioContext.createBufferSource();
    source.buffer = audioContext.createBuffer(2, audioContext.sampleRate, audioContext.sampleRate);
    source.start();
    worker.postMessage({event: 'readFile', data: event.target.result});
  }).catch(error => console.log(error));
}

worker.onmessage = function(message) {
  nesWorkletNode.port.postMessage(message.data);   // Send address and data to APU
};

/**
 * |**************|
 * | Read NES ROM |
 * |**************|
 */

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
    console.log(key);
    const button = localStorage.getItem(key.id);
    if (button) {
      key.value = button;
    } else {
      key.value = key.defaultValue;
    }
  }

  dialog.showModal();
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
});

/**
 * Abort function if player has left empty input fields when trying to save the controller configuration.
 * Store the controller configuration in local storage if no fields are empty.
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
});

const keys = document.getElementsByClassName('key');
for (const key of keys) {
  key.addEventListener('focus', onFocus);
  key.addEventListener('focusout', onFocusOut);
  key.addEventListener('keydown', onKeyDown);
  key.addEventListener('keyup', onKeyUp);
}

/**
 *  Remove the input character in order to prepare the field for the pressed key's code.
 */
function onFocus(event) {
  event.target.value = '';
}

/**
 *  If input text field is empty when focus is removed, add the button's default value instead.
 */
function onFocusOut(event) {
  event.target.classList.remove('missing');
  if (!event.target.value) {
    event.target.value = event.target.defaultValue;
  }
}

/**
 *  Set default value if button has no value.
 */
function onKeyUp(event) {
  if (!event.code) {
    event.target.value = event.target.defaultValue;
  }
}

/**
 *  Show key code in input text field.
 */
function onKeyDown(event) {
  removeKeyAlreadyTaken(event);
  event.target.value = event.code;
  event.preventDefault();
}

/**
 *  Removes the chosen key from other buttons if already in use.
 */
function removeKeyAlreadyTaken(event) {
  const keyCode = event.code;
  for (const key of keys) {
    if (Object.is(key.value, keyCode)) {
      key.value = '';
    }
  }
}
