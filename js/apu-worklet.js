import { APU } from './apu/apu.js';

/**
 * Does the actual audio processing in a Web Audio rendering thread.
 *
 * It lives in the AudioWorkletGlobalScope and runs on the Web Audio rendering thread.
 * In turn, an AudioWorkletNode based on it runs on the main thread.
 */
export class NesApuProcessor extends AudioWorkletProcessor {
  audioSamples = [];
  apu = new APU();
  SOUND_VOLUME = 15;      // increase sound volume by a factor of 15

  /**
   * The sound system will be running at approximately 44kHz and the NES clock is running in MHz, therefore a number of
   * NES clocks must be executed to be equivalent to 1 sound sample duration. This method informs the APU about the
   * temporal properties of the surrounding emulation system.
   */
  audioTime = 0.0;                              // Accumulates elapsed audio time in between system samples
  audioTimePerSystemSample = 1.0 / 44100;       // The real-time duration between samples required by the sound hardware
  audioTimePerNesClock = 1.0 / 5369318.0;       // The real-time duration that elapses during a real-time NES clock. This will be a constant describing how much artificial real-time passes per NES clock.

  constructor() {
    super();
    this.port.onmessage = (e) => {
      this.apu.write(e.data.address, e.data.data);
    }
  }

  /**
   *  Here is the sound processed and outputted to the speakers.
   */
  process(inputs, outputs, parameters) {
    const output = outputs[0];

    // Synchronising with Audio
    while (this.audioSamples.length < 2048) {
      this.apu.clock();
      this.audioTime += this.audioTimePerNesClock;
      if (this.audioTime >= this.audioTimePerSystemSample) {
        this.audioTime -= this.audioTimePerSystemSample;
        this.audioSamples.push(this.SOUND_VOLUME * this.apu.mixedOutputSample());
      }
    }

    if (this.audioSamples.length >= 128) {
      output.forEach((channel) => {
        const samples = this.audioSamples.splice(0, channel.length);

        for (let i = 0; i < channel.length; i++) {
          channel[i] = samples[i];
        }
      });
    }

    return true;
  }

  reset() {
    this.audioSamples = [];
    this.apu.reset();
    this.audioTime = 0.0;
  }
}

registerProcessor('apu-worklet', NesApuProcessor);
