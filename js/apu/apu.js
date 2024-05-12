import { LengthCounter } from "./counter.js";
import { Sweeper } from "./sweeper.js";
import { Envelope } from "./envelope.js";
import { Sequencer } from "./sequencer.js";
import { SquareWave } from "./square.js";

/**
 * The sample rate for the system is 44100 Hz.
 *
 * The CPU talks to the Lc_apu via ports $4000 - $4015 and $4017. The Lc_apu has 5 channels: Square1, Square2, Triangle, Noise,
 * and DMC. The DMC channel plays samples (often vocals). Before the channels can be used to produce sounds, they need
 * to be enabled. Channels are toggled on and off via port $4015.
 *
 * The formula for knowing which 11-bit period values correspond to which notes? is:
 *    P = C/(F*16) - 1      where P = Period, C = CPU speed (in Hz), F = Frequency of the note (also in Hz).
 *
 * The value of C differs between NTSC and PAL machines, which is why a game made for NTSC will sound funny
 * on a PAL NES, and vice-versa.
 */
export class APU {
  enableTriangle = false;
  enableSquare1 = false;
  enableSquare2 = false;
  enableNoise = false;
  enableDMC = false;

  globalTime = 0.0;
  frameClockCounter = new Uint32Array(1);   // Used to maintain the musical timing of the APU
  clockCounter = new Uint32Array(1);
  useRawMode = false;
  lengthTable = [10, 254, 20,  2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30 ];

  //  Square wave 1 channel
  period1 = new Uint16Array(1);
  volumeSquare1 = 0x0;
  disableSawEnvelopeSquare1 = false;      // Saw Envelope Disable (0: use internal counter for volume; 1: use Volume for volume)
  disableLengthCounterSquare1 = false;    // Length Counter Disable (0: use Length Counter; 1: disable Length Counter)
  haltSquare1 = false;
  dutyCycleSquare1 = 0x00;
  square1Sample = 0.0;                    // Is outputted to he sound source
  square1Output = 0.0;
  square1Sequencer = new Sequencer();
  squareWave1 = new SquareWave();
  square1Envelope = new Envelope();
  square1Sweeper = new Sweeper();
  square1LengthCounter = new LengthCounter();

  //  Square wave 2 channel
  period2 = new Uint16Array(1);
  volumeSquare2 = 0x0;
  disableSawEnvelopeSquare2 = false;      // Saw Envelope Disable (0: use internal counter for volume; 1: use Volume for volume)
  disableLengthCounterSquare2 = false;    // Length Counter Disable (0: use Length Counter; 1: disable Length Counter)
  haltSquare2 = false;
  dutyCycleSquare2 = 0x00;
  square2Sample = 0.0;
  square2Output = 0.0;
  square2Sequencer = new Sequencer();
  squareWave2 = new SquareWave();
  square2Envelope = new Envelope();
  square2Sweeper = new Sweeper();
  square2LengthCounter = new LengthCounter();

  //  Noise channel
  volumeNoise = 0x0;
  disableSawEnvelopeNoise = false;      // Saw Envelope Disable (0: use internal counter for volume; 1: use Volume for volume)
  disableLengthCounterNoise = false;    // Length Counter Disable (0: use Length Counter; 1: disable Length Counter)
  haltNoise = false;
  noiseOutput = 0.0;
  noiseSequencer = new Sequencer();
  noiseEnvelope = new Envelope();
  noiseLengthCounter = new LengthCounter();

  constructor() {
    this.noiseSequencer.sequence[0] = 0xDBDB;
  }

  /**
   * All output samples from different channels get mixed together.
   */
  getOutputSample() {
    if (this.useRawMode) {
      return (this.square1Sample - 0.5) * 0.5 + (this.square2Sample - 0.5) * 0.5;
    } else {
      return (this.square1Output - 0.8) * 0.1 + (this.square2Output - 0.8) * 0.1 +
        ((2.0 * (this.noiseOutput - 0.5))) * 0.1;
    }
  }

  /**
   * Change Bus clock() to return boolean to main thread loop?
   * Returns true if that particular clock cycle yielded a new audio sample in real time. This way we can repeatedly
   * clock until this method returns true, because we are clocking from our sound thread and the sound thread is
   * requesting a single sample.
   *
   * Runs at half the speed of the CPU clock. Thus, the PPU clock is 6 times faster than the APU clock.
   *
   * Depending on the frame count, we set a flag to tell us where we are in the sequence. Essentially, changes
   * to notes only occur at these intervals, meaning, in a way, this is responsible for ensuring musical time is maintained.
   */
  clock() {
    let quarterFrameClock = false;      // Indicates quarter of the frame
    let halfFrameClock = false;         // Indicates half of the frame

    this.globalTime += (0.3333333333 / 1789773);

    if (this.clockCounter[0] % 6 === 0) {     // The PPU clock runs 6 times faster than the APU clock

      this.frameClockCounter[0]++;

      // 4-Step Sequence Mode
      if (this.frameClockCounter[0] === 3729) {
        quarterFrameClock = true;
      }

      if (this.frameClockCounter[0] === 7457) {
        quarterFrameClock = true;
        halfFrameClock = true;
      }

      if (this.frameClockCounter[0] === 11186) {
        quarterFrameClock = true;
      }

      if (this.frameClockCounter[0] === 14916) {
        quarterFrameClock = true;
        halfFrameClock = true;
        this.frameClockCounter[0] = 0;
      }

      // Update functional units

      // Quarter frame "beats" adjust the volume envelope
      if (quarterFrameClock) {
        this.square1Envelope.clock(this.haltSquare1);
        this.square2Envelope.clock(this.haltSquare2);
        this.noiseEnvelope.clock(this.haltNoise);
      }

      // Half frame "beats" adjust the note length and frequency sweepers
      if (halfFrameClock) {
        this.square1LengthCounter.clock(this.enableSquare1, this.haltSquare1);
        this.square2LengthCounter.clock(this.enableSquare2, this.haltSquare2);
        this.noiseLengthCounter.clock(this.enableNoise, this.haltNoise);
        this.square1Sweeper.clock(this.square1Sequencer.reload[0], 0);
        this.square2Sweeper.clock(this.square2Sequencer.reload[0], 1);
      }

      this.square1Sequencer.clock(this.enableSquare1);

      this.squareWave1.frequency = 1789773.0 / (16.0 * (this.square1Sequencer.reload[0] + 1));
      this.squareWave1.amplitude = (this.square1Envelope.output[0] - 1.0) / 16.0;
      this.square1Sample = this.squareWave1.sample(this.globalTime);

      if (this.square1LengthCounter.counter > 0 && this.square1Sequencer.timer[0] >= 8 && !this.square1Sweeper.mute && this.square1Envelope.output[0] > 2) {
        this.square1Output += (this.square1Sample - this.square1Output) * 0.5;
      } else {
        this.square1Output = 0.0;
      }

      this.square2Sequencer.clock(this.enableSquare2);

      this.squareWave2.frequency = 1789773.0 / (16.0 * (this.square2Sequencer.reload[0] + 1));
      this.squareWave2.amplitude = (this.square2Envelope.output[0]-1) / 16.0;
      this.square2Sample = this.squareWave2.sample(this.globalTime);

      if (this.square2LengthCounter.counter > 0 && this.square2Sequencer.timer[0] >= 8 && !this.square2Sweeper.mute && this.square2Envelope.output[0] > 2) {
        this.square2Output += (this.square2Sample - this.square2Output) * 0.5;
      } else {
        this.square2Output = 0.0;
      }

      this.noiseSequencer.clock(this.enableNoise, true);

      if (this.noiseLengthCounter.counter > 0 && this.noiseSequencer.timer[0] >= 8) {
        this.noiseOutput = this.noiseSequencer.output[0] * ((this.noiseEnvelope.output[0]-1) / 16.0);
      }

      if (!this.enableSquare1) {
        this.square1Output = 0.0;
      }
      if (!this.enableSquare2) {
        this.square2Output = 0.0;
      }
      if (!this.enableNoise) {
        this.noiseOutput = 0;
      }
    }

    // Frequency sweepers change at high frequency
    this.square1Sweeper.track(this.square1Sequencer.reload[0]);
    this.square2Sweeper.track(this.square2Sequencer.reload[0]);

    this.clockCounter[0]++;
  }

  /**
   * Square1 is controlled with ports $4000 - $4003. Square2 is controlled with ports $4004 - $4007.
   * The Triangle channel produces triangle waveforms. Unlike the Square channels, we have no control over the Triangle
   * channel's volume or tone. The Triangle channel is manipulated via ports $4008-$400B.
   */
  writeByCPU(address, data) {
    switch (address) {
      case 0x4000:
        switch ((data & 0xC0) >> 6) {
          case 0x00:
            this.square1Sequencer.newSequence[0] = 0b01000000;
            this.squareWave1.dutyCycle = 0.125;
            break;
          case 0x01:
            this.square1Sequencer.newSequence[0] = 0b01100000;
            this.squareWave1.dutyCycle = 0.250;
            break;
          case 0x02:
            this.square1Sequencer.newSequence[0] = 0b01111000;
            this.squareWave1.dutyCycle = 0.500;
            break;
          case 0x03:
            this.square1Sequencer.newSequence[0] = 0b10011111;
            this.squareWave1.dutyCycle = 0.750;
            break;
        }
        this.square1Sequencer.sequence[0] = this.square1Sequencer.newSequence[0];
        this.haltSquare1 = (data & 0x20) > 0;
        this.square1Envelope.volume[0] = (data & 0x0F);
        this.square1Envelope.disable = (data & 0x10) > 0;
        break;

      case 0x4001:
        this.square1Sweeper.enabled = (data & 0x80) > 0;
        this.square1Sweeper.period = (data & 0x70) >> 4;
        this.square1Sweeper.down = (data & 0x08) > 0;
        this.square1Sweeper.shift = data & 0x07;
        this.square1Sweeper.reload = true;
        break;

      case 0x4002:
        this.square1Sequencer.reload[0] = (this.square1Sequencer.reload[0] & 0xFF00) | data;
        break;

      case 0x4003:
        this.square1Sequencer.reload[0] = ((data & 0x07) << 8) | (this.square1Sequencer.reload[0] & 0x00FF);
        this.square1Sequencer.timer[0] = this.square1Sequencer.reload[0];
        this.square1Sequencer.sequence[0] = this.square1Sequencer.newSequence[0];
        this.square1LengthCounter.counter = this.lengthTable[(data & 0xF8) >> 3];
        this.square1Envelope.start = true;
        break;

      case 0x4004:
        switch ((data & 0xC0) >> 6) {
          case 0x00:
            this.square2Sequencer.newSequence[0] = 0b01000000;
            this.squareWave2.dutyCycle = 0.125;
            break;
          case 0x01:
            this.square2Sequencer.newSequence[0] = 0b01100000;
            this.squareWave2.dutyCycle = 0.250;
            break;
          case 0x02:
            this.square2Sequencer.newSequence[0] = 0b01111000;
            this.squareWave2.dutyCycle = 0.500;
            break;
          case 0x03:
            this.square2Sequencer.newSequence[0] = 0b10011111;
            this.squareWave2.dutyCycle = 0.750;
            break;
        }
        this.square2Sequencer.sequence[0] = this.square2Sequencer.newSequence[0];
        this.haltSquare2 = (data & 0x20) > 0;
        this.square2Envelope.volume[0] = (data & 0x0F);
        this.square2Envelope.disable = (data & 0x10) > 0;
        break;

      case 0x4005:
        this.square2Sweeper.enabled = (data & 0x80) > 0;
        this.square2Sweeper.period = (data & 0x70) >> 4;
        this.square2Sweeper.down = (data & 0x08) > 0;
        this.square2Sweeper.shift = data & 0x07;
        this.square2Sweeper.reload = true;
        break;

      case 0x4006:
        this.square2Sequencer.reload[0] = (this.square2Sequencer.reload[0] & 0xFF00) | data;
        break;

      case 0x4007:
        this.square2Sequencer.reload[0] = ((data & 0x07) << 8) | (this.square2Sequencer.reload[0] & 0x00FF);
        this.square2Sequencer.timer[0] = this.square2Sequencer.reload[0];
        this.square2Sequencer.sequence[0] = this.square2Sequencer.newSequence[0];
        this.square2LengthCounter.counter = this.lengthTable[(data & 0xF8) >> 3];
        this.square2Envelope.start = true;
        break;

      case 0x4008:
        break;

      case 0x400C:
        this.noiseEnvelope.volume[0] = (data & 0x0F);
        this.noiseEnvelope.disable = (data & 0x10) > 0;
        this.haltNoise = (data & 0x20) > 0;
        break;

      case 0x400E:
        switch (data & 0x0F) {
          case 0x00:
            this.noiseSequencer.reload[0] = 0;
            break;
          case 0x01:
            this.noiseSequencer.reload[0] = 4;
            break;
          case 0x02:
            this.noiseSequencer.reload[0] = 8;
            break;
          case 0x03:
            this.noiseSequencer.reload[0] = 16;
            break;
          case 0x04:
            this.noiseSequencer.reload[0] = 32;
            break;
          case 0x05:
            this.noiseSequencer.reload[0] = 64;
            break;
          case 0x06:
            this.noiseSequencer.reload[0] = 96;
            break;
          case 0x07:
            this.noiseSequencer.reload[0] = 128;
            break;
          case 0x08:
            this.noiseSequencer.reload[0] = 160;
            break;
          case 0x09:
            this.noiseSequencer.reload[0] = 202;
            break;
          case 0x0A:
            this.noiseSequencer.reload[0] = 254;
            break;
          case 0x0B:
            this.noiseSequencer.reload[0] = 380;
            break;
          case 0x0C:
            this.noiseSequencer.reload[0] = 508;
            break;
          case 0x0D:
            this.noiseSequencer.reload[0] = 1016;
            break;
          case 0x0E:
            this.noiseSequencer.reload[0] = 2034;
            break;
          case 0x0F:
            this.noiseSequencer.reload[0] = 4068;
            break;
        }
        break;

      case 0x4015: // STATUS
        this.enableSquare1 = (data & 0x01) > 0;
        this.enableSquare2 = (data & 0x02) > 0;
        this.enableNoise = (data & 0x04) > 0;
        break;

      case 0x400F:
        this.square1Envelope.start = true;
        this.square2Envelope.start = true;
        this.noiseEnvelope.start = true;
        this.noiseLengthCounter.counter = this.lengthTable[(data & 0xF8) >> 3];
        break;
    }
  }

  readByCPU(address) {
    return 0x00;
  }

  reset() {

  }
}

