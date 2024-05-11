/**
 * Does the actual audio processing in a Web Audio rendering thread.
 *
 * It lives in the AudioWorkletGlobalScope and runs on the Web Audio rendering thread.
 * In turn, an AudioWorkletNode based on it runs on the main thread.
 */
class NesApuProcessor extends AudioWorkletProcessor {
  audioSamples = [];

  constructor() {
    super();
    this.port.onmessage = (e) => {
      this.audioSamples = this.audioSamples.concat(e.data);
    }
  }


  /**

   */

  /**
   *  Here is the sound processed and outputted to the speakers.
   */
  process(inputs, outputs, parameters) {
    const output = outputs[0];

    if (this.audioSamples.length >= 128) {
      output.forEach((channel) => {
        const samples = this.audioSamples.splice(0, channel.length);

        for (let i = 0; i < channel.length; i++) {
          channel[i] = samples[i];
        }
      });
    }
    return true
  }
}

registerProcessor('apu-worklet', NesApuProcessor);
