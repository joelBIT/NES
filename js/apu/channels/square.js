import { LengthCounter } from "../counter.js";
import { Sequencer } from "../sequencer.js";
import { Envelope } from "../envelope.js";
import { Sweeper } from "../sweeper.js";

/**
 * A Square wave (channels 1 and 2). Each of the two NES APU pulse (square) wave channels generate a pulse wave with variable duty.
 *
 * Once a waveform is generated it is associated with a length (how long is it played for) and it can also be swept (its
 * frequency can be changed in real time).
 * Volume is 4 bits long so it can have a value from 0-F, where F is the loudest. Duty Cycle controls the tone, i.e., the
 * amount of time the wave is active or on.
 *
 * Each pulse channel contains the following: envelope generator, sweep unit, timer, 8-step sequencer, length counter.
 *
 *
 *                               Sweep -----> Timer
 *                                |            |
 *                                |            |
 *                                |            v
 *                                |        Sequencer   Length Counter
 *                                |            |             |
 *                                |            |             |
 *                                v            v             v
 *            Envelope -------> Gate -----> Gate -------> Gate --->(to mixer)
 *
 */
export class SquareChannel {
  id;
  frequency = 0.0;
  dutyCycle = 0.0;
  amplitude = 1;
  pi = 3.14159;
  harmonics = 20;
  enabled = false;
  halted = false;

  dutyCycleSequences = [{duty: 0.125, waveform: 0b01000000}, {duty: 0.250, waveform: 0b01100000},
                        {duty: 0.500, waveform: 0b01111000}, {duty: 0.750, waveform: 0b10011111}];

  linearCounter = new LengthCounter();
  lengthCounter = new LengthCounter();
  output = 0.0;
  sequencer = new Sequencer();
  envelope = new Envelope();
  sweeper = new Sweeper();

  constructor(id = 1) {
    this.id = id;
  }

  clockSweeper() {
    this.sequencer.setReloadValue(this.sweeper.clock(this.sequencer.getReloadValue(), this.id));
  }

  setVolume(volume) {
    this.envelope.setVolume(volume);
  }

  disableEnvelope(disable) {
    this.envelope.setDisable(disable);
  }

  haltCounter(halt) {
    this.lengthCounter.setHalt(halt);
  }

  startEnvelope() {
    this.envelope.start();
  }

  setSequence() {
    this.sequencer.setSequence();
  }

  setSweeper(data) {
    this.sweeper.setup(data);
  }

  setDuty(index) {
    const sequence = this.dutyCycleSequences[index];
    this.sequencer.setOutputWaveForm(sequence.waveform);
    this.dutyCycle = sequence.duty;
  }

  clockCounter() {
    this.lengthCounter.clock(this.enabled);
  }

  clearCounter() {
    this.lengthCounter.clear();
  }

  reloadTimer() {
    this.sequencer.reloadTimer();
  }

  setReloadValue(value) {
    this.sequencer.setReloadValue(value);
  }

  trackSweeper() {
    this.sweeper.track(this.sequencer.getReloadValue());
  }

  getSequencerReload() {
    return this.sequencer.getReloadValue();
  }

  clockEnvelope() {
    this.envelope.clock(this.halted);
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

  approxsin(t) {
    let j = t * 0.15915;
    j = j - Math.floor(j);
    return 20.785 * j * (j - 0.5) * (j - 1.0);
  };

  sample(time) {
    let a = 0.0;
    let b = 0.0;
    let p = this.dutyCycle * 2.0 * this.pi;

    for (let n = 1; n < this.harmonics; n++) {
      let c = n * this.frequency * 2.0 * this.pi * time;
      a += -this.approxsin(c) / n;
      b += -this.approxsin(c - p * n) / n;
    }

    return (2.0 * this.amplitude / this.pi) * (a - b);
  }

  clock() {
    if (this.enabled) {
      this.sequencer.decrementTimer();
      if (this.sequencer.getTimer() === 0xFFFF) {
        this.sequencer.reloadTimer();
        this.sequencer.setSequence(((this.sequencer.getSequence() & 0x0001) << 7) | ((this.sequencer.getSequence() & 0x00FE) >> 1));
        this.sequencer.setOutput(this.sequencer.getSequence() & 0x00000001);
      }
    }
  }

  getOutput(time) {
    this.frequency = 1789773.0 / (16.0 * (this.sequencer.getReloadValue() + 1));
    this.amplitude = (this.envelope.getOutput() - 1) / 16.0;
    const sample = this.sample(time);

    if (this.lengthCounter.getCounter() > 0 && this.sequencer.getTimer() >= 8 && !this.sweeper.isMuted() && this.envelope.getOutput() > 2) {
      this.output += (sample - this.output) * 0.5;
    } else {
      this.output = 0.0;
    }
    return this.output;
  }

  reset() {
    this.frequency = 0.0;
    this.dutyCycle = 0.0;
    this.amplitude = 1;
    this.enabled = false;
    this.halted = false;
    this.linearCounter.reset();
    this.lengthCounter.reset();
    this.output = 0.0;
    this.sequencer.reset();
    this.envelope.reset();
    this.sweeper.reset();
  }
}
