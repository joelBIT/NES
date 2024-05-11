'use strict';

const worker = new Worker('js/emulator.js',{ type: "module" });
let audioContext;
let audioBuffer;

window.onload = e => {
  audioContext = new AudioContext();
  audioBuffer = audioContext.createBuffer(1, audioContext.sampleRate*2, audioContext.sampleRate);
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
  worker.postMessage({event: 'readFile', data: event.target.result});
}

worker.onmessage = function(message) {
  const source = audioContext.createBufferSource();
  const receivedBuffer = message.data.audioSample;
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
  audioBuffer.copyToChannel(new Float32Array(receivedBuffer), 0);
};

document.getElementById('audio').addEventListener("click", (e) => {
  audioContext.audioWorklet.addModule('js/apu-worklet.js', { credentials: "omit" }).then(() => {
    worker.postMessage({event: 'audio'});
  });
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
