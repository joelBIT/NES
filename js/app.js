'use strict';

const worker = new Worker('js/emulator.js');

window.onload = e => {
  const canvas = document.getElementById("nesCanvas").transferControlToOffscreen();
  worker.postMessage({ canvas: canvas }, [canvas]);
};

const keyUpEventLogger =  function (e) {
  // Handle input for controller in port #1
  worker.postMessage({event: 'keyup', value: e.code});
};

const keyDownEventLogger =  function (e) {
  worker.postMessage({event: 'keydown', value: e.code});
};

window.addEventListener("keyup", keyUpEventLogger);
window.addEventListener("keydown", keyDownEventLogger);

worker.onmessage = function(message) {
  console.log(message);
};

function readFile(event) {
  worker.postMessage({event: 'readFile', data: event.target.result});
}

document.getElementById('press').addEventListener("click", (e) => {
  worker.postMessage({event: 'press'});
});

document.getElementById('infinite').addEventListener("click", (e) => {
  worker.postMessage({event: 'infinite'});
});

document.getElementById("nesfile").addEventListener('change', input => {
  if (!input.target.files.length) {
    alert('no files');
    return;
  }
  console.log(input.target.files[0]);

// alert(input.target.files[0].name);
//   alert(input.target.files[0].size);
//   alert(input.target.files[0].type);      // check for type: application/x-nes-rom      ??

  const fileReader = new FileReader();
  fileReader.addEventListener('load', readFile);
  fileReader.readAsArrayBuffer(input.target.files[0]);
});





