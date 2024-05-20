'use strict';

const worker = new Worker('js/emulator.js',{ type: "module" });
let nesWorkletNode;

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

  const fileReader = new FileReader();
  fileReader.addEventListener('load', readFile);
  fileReader.readAsArrayBuffer(input.target.files[0]);
});
