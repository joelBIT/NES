import { LengthCounter } from './counter.js';
import { Sequencer } from "./sequencer.js";

/**
 *  The NES APU triangle channel generates a pseudo-triangle wave. It has no volume control; the waveform is either
 *  cycling or suspended. It includes a linear counter, an extra duration timer of higher accuracy than the length counter.
 *  For any given period, the triangle channel's frequency is half that of the pulse channel, or a pitch one octave lower.
 *
 *  The triangle channel contains the following: timer, length counter, linear counter, linear counter reload flag,
 *  control flag, sequencer.
 *
 *                Linear Counter   Length Counter
 *                        |                |
 *                        v                v
 *            Timer ---> Gate ----------> Gate ---> Sequencer ---> (to mixer)
 *
 */
export class TriangleChannel {
  enabled = false;
  halted = false;         // Length counter halt / linear counter start
  reloadLinear = false;

  sequenceTable = [0xF, 0xE, 0xD, 0xC, 0xB, 0xA, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0,
    0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xA, 0xB, 0xC, 0xD, 0xE, 0xF];

  linearCounter = new LengthCounter();    // gives the triangle shaped waveform.
  lengthCounter = new LengthCounter();
  output = 0.0;
  index = 0;
  sequencer = new Sequencer();
  linearCounterReloadValue = new Uint8Array(1);

  setSequence() {
    this.sequencer.setSequence();
  }

  clockCounter() {
    this.lengthCounter.clock(this.enabled);
  }

  reloadTimer() {
    this.sequencer.reloadTimer();
  }

  setReloadValue(value) {
    this.sequencer.setReloadValue(value);
  }

  getSequencerReload() {
    return this.sequencer.getReload();
  }

  clearCounter() {
    this.lengthCounter.clear();
  }

  setCounter(index) {
    this.lengthCounter.setCounter(index);
  }

  setLinearCounterReloadValue(value) {
    this.linearCounterReloadValue[0] = value;
  }

  setEnable(enable) {
    this.enabled = enable;
  }

  isEnabled() {
    return this.enabled;
  }

  setHalt(halt) {
    this.halted = halt;
    this.lengthCounter.setHalt(halt);
  }

  setReloadLinear() {
    this.reloadLinear = true;
  }

  clockLinearCounter() {
    if (this.reloadLinear) {
      this.linearCounter.setCustomCounter(this.linearCounterReloadValue[0]);
    } else if (this.linearCounter.getCounter() !== 0 && this.halted) {
        this.linearCounter.clock(this.enabled);
    }
    if (!this.halted) {
      this.reloadLinear = false;
    }
  }

  clock() {
    if (this.enabled) {
      this.sequencer.decrementTimer();
      if (this.sequencer.getTimer() === 0xFFFF) {
        this.sequencer.reloadTimer();
        this.sequencer.setOutput(this.sequenceTable[this.index++]);
        if (this.sequencer.getReload() < 2) {
          // ultrasonic
          this.sequencer.setOutput(7.5);
        }
        this.index &= 0x1F;
      }
    }
  }

  /**
   * Maintain current output value to avoid popping audio.
   */
  getOutput() {
    if (this.lengthCounter.getCounter() > 0 && this.linearCounter.getCounter() > 0) {
      this.output = this.sequencer.getOutput();
    }
    return this.output;
  }

  reset() {
    this.linearCounter.reset();
    this.lengthCounter.reset();
    this.output = 0.0;
    this.linearCounterReloadValue[0] = 0;
    this.index = 0;
    this.sequencer.reset();
    this.enabled = false;
    this.reloadLinear = false;
    this.halted = false;
  }
}
