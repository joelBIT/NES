import { LengthCounter } from "./counter.js";
import { Envelope } from "./envelope.js";
import { Sequencer } from "./sequencer.js";

/**
 * Generates a psuedo-random noise at 16 different frequencies.
 */
export class NoiseChannel {
  enabled = false;
  halted = false;
  lengthCounter = new LengthCounter();
  envelope = new Envelope();
  sequencer = new Sequencer();
  output = 0.0;
  shift = 1;      // noiseShift = 1;
  tonal = false;  // noiseTonal = false

  constructor() {
    this.sequencer.setSequence(0xDBDB);
  }

  setVolume(volume) {
    this.envelope.setVolume(volume);
  }

  disableEnvelope(disable) {
    this.envelope.setDisable(disable);
  }

  startEnvelope(start) {
    this.envelope.setStart(start);
  }

  clockCounter() {
    this.lengthCounter.clock(this.enabled);
  }

  clearCounter() {
    this.lengthCounter.clear();
  }

  clockEnvelope() {
    this.envelope.clock(this.halted);
  }

  setReload(index) {
    this.sequencer.setReload(index);
  }

  setCounter(index) {
    this.lengthCounter.setCounter(index);
  }

  setEnable(enable) {
    this.enabled = enable;
  }

  isEnabled() {
    return this.enabled;
  }

  setHalt(halt) {
    this.halted = halt;
  }

  isHalted() {
    return this.halted;
  }

  setTonal(tonal) {
    this.tonal = tonal;
  }

  clock() {
    if (this.enabled) {
      this.sequencer.decrementTimer();
      if (this.sequencer.getTimer() === 0xFFFF) {
        this.sequencer.reloadTimer();
        this.sequencer.setSequence((((this.sequencer.getSequence() & 0x0001) ^ ((this.sequencer.getSequence() & 0x0002) >> 1)) << 14) | ((this.sequencer.getSequence() & 0x7FFF) >> 1));
        this.sequencer.setOutput(this.sequencer.getSequence() & 0x00000001);
      }
    }
  }

  getOutput() {
    if (this.lengthCounter.getCounter() > 0 && this.sequencer.getTimer() >= 8) {
      this.output = this.sequencer.getOutput() * ((this.envelope.getOutput() - 1) / 16.0);
    }
    return this.output;
  }
}
