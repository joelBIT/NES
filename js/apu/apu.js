import { SquareChannel } from "./channels/square.js";
import { TriangleChannel } from "./channels/triangle.js";
import { NoiseChannel } from "./channels/noise.js";
import { DeltaModulationChannel } from "./channels/dmc.js";

/**
 * The sample rate for the system is 44100 Hz.
 *
 * The CPU talks to the APU via ports $4000 - $4015 and $4017. The APU has 5 channels: Square1, Square2, Triangle, Noise,
 * and DMC. The Delta modulation channel (DMC) plays samples (often vocals). Before the channels can be used to produce
 * sounds, they need to be enabled. Channels are toggled on and off via port $4015.
 */
export class APU {
  globalTime = 0.0;
  frameClockCounter = new Uint32Array(1);   // Used to maintain the musical timing of the APU
  clockCounter = new Uint32Array(1);

  //  Square wave 1 channel
  square1Output = 0.0;
  squareChannel1 = new SquareChannel();

  //  Square wave 2 channel
  square2Output = 0.0;
  squareChannel2 = new SquareChannel(2);

  // Triangle channel
  triangleOutput = 0.0;
  triangleChannel = new TriangleChannel();

  //  Noise channel
  noiseOutput = 0.0;
  noiseChannel = new NoiseChannel();

  // Delta modulation channel
  dmcOutput = 0.0;
  deltaModulationChannel = new DeltaModulationChannel();

  /**
   * All output samples from the channels get mixed together.
   */
  mixedOutputSample() {
    return 0.00752 * (this.square1Output + this.square2Output) + 0.00494 * this.noiseOutput + 0.00851 * this.triangleOutput + 0.00335 * this.dmcOutput;
  }

  /**
   * Runs at half the speed of the CPU clock. Thus, the PPU clock is 6 times faster than the APU clock.
   *
   * Depending on the frame count, we set a flag to tell us where we are in the sequence. Essentially, changes
   * to notes only occur at these intervals, meaning, in a way, this is responsible for ensuring musical time is maintained.
   */
  clock() {
    let quarterFrameClock = false;      // Indicates quarter of the frame
    let halfFrameClock = false;         // Indicates half of the frame

    this.globalTime += (0.3333333333 / 1789773);

    if (this.clockCounter[0] % 6 === 0) {

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

      // Quarter frame "beats" adjust the volume envelope
      if (quarterFrameClock) {
        this.squareChannel1.clockEnvelope();
        this.squareChannel2.clockEnvelope();
        this.noiseChannel.clockEnvelope();

        this.triangleChannel.clockLinearCounter();    // The linear counter is clocked at 240 Hz (1/4 framerate)
      }

      // Half frame "beats" adjust the note length and frequency sweepers
      if (halfFrameClock) {
        this.squareChannel1.clockCounter();
        this.squareChannel2.clockCounter();
        this.noiseChannel.clockCounter();
        this.squareChannel1.clockSweeper();
        this.squareChannel2.clockSweeper();

        this.triangleChannel.clockCounter();
      }

      this.squareChannel1.clock();
      this.square1Output = this.squareChannel1.getOutput(this.globalTime);

      this.squareChannel2.clock();
      this.square2Output = this.squareChannel2.getOutput(this.globalTime);

      this.triangleChannel.clock();
      this.triangleOutput = this.triangleChannel.getOutput();

      this.noiseChannel.clock();
      this.noiseOutput = this.noiseChannel.getOutput();

      this.deltaModulationChannel.clock();
      this.dmcOutput = this.deltaModulationChannel.getOutput();


      if (!this.squareChannel1.isEnabled()) {
        this.square1Output = 0.0;
      }
      if (!this.squareChannel2.isEnabled()) {
        this.square2Output = 0.0;
      }
      if (!this.triangleChannel.isEnabled()) {
        this.triangleOutput = 0.0;
      }
      if (!this.noiseChannel.isEnabled()) {
        this.noiseOutput = 0.0;
      }
      if (!this.deltaModulationChannel.isEnabled()) {
        this.dmcOutput = 0.0;
      }
    }

    this.squareChannel1.trackSweeper();
    this.squareChannel2.trackSweeper();

    this.clockCounter[0]++;
  }

  /**
   * Square 1 channel is controlled with ports $4000 - $4003. Square 2 channel is controlled with ports $4004 - $4007.
   * Unlike the Square channels, we have no control over the Triangle channel's volume or tone. The Triangle channel
   * is manipulated via ports $4008-$400B.
   */
  write(address, data) {
    switch (address) {

        /*
           *********************
           | First Square Wave |
           *********************
       */

      /**
       *    76543210
       *    ||||||||
       *    ||||++++- Volume
       *    |||+----- Saw Envelope Disable (0: use internal counter for volume; 1: use Volume for volume)
       *    ||+------ Length Counter Disable (0: use Length Counter; 1: disable Length Counter)
       *    ++------- Duty Cycle
       */
      case 0x4000:
        this.squareChannel1.setDuty((data & 0xC0) >> 6);
        this.squareChannel1.setSequence();
        this.squareChannel1.setHalt(data & 0x20);
        this.squareChannel1.setVolume(data & 0x0F);
        this.squareChannel1.disableEnvelope(data & 0x10);
        this.squareChannel1.haltCounter(data & 0x20);
        break;

      case 0x4001:
        this.squareChannel1.setSweeper(data);
        break;

      case 0x4002:
        this.squareChannel1.setReloadValue((this.squareChannel1.getSequencerReload() & 0xFF00) | data);
        break;

      case 0x4003:
        this.squareChannel1.setReloadValue(((data & 0x07) << 8) | (this.squareChannel1.getSequencerReload() & 0x00FF));
        this.squareChannel1.reloadTimer();
        this.squareChannel1.setSequence();
        if (this.squareChannel1.isEnabled()) {
          this.squareChannel1.setCounter((data & 0xF8) >> 3);
        }
        this.squareChannel1.startEnvelope();
        break;



        /*
           **********************
           | Second Square Wave |
           **********************
       */

      case 0x4004:
        this.squareChannel2.setDuty((data & 0xC0) >> 6);
        this.squareChannel2.setHalt(data & 0x20);
        this.squareChannel2.setVolume(data & 0x0F);
        this.squareChannel2.disableEnvelope(data & 0x10);
        this.squareChannel2.haltCounter(data & 0x20);
        this.squareChannel2.setSequence();
        break;

      case 0x4005:
        this.squareChannel2.setSweeper(data);
        break;

      case 0x4006:
        this.squareChannel2.setReloadValue((this.squareChannel2.getSequencerReload() & 0xFF00) | data);
        break;

      case 0x4007:
        this.squareChannel2.setReloadValue(((data & 0x07) << 8) | (this.squareChannel2.getSequencerReload() & 0x00FF));
        this.squareChannel2.reloadTimer();
        if (this.squareChannel2.isEnabled()) {
          this.squareChannel2.setCounter((data & 0xF8) >> 3);
        }
        this.squareChannel2.startEnvelope();
        this.squareChannel2.setSequence();
        break;




        /*
            *****************
            | Triangle Wave |
            *****************
        */

      case 0x4008:
        this.triangleChannel.setHalt(data & 0x80);    // Length counter halt / linear counter start
        this.triangleChannel.setLinearCounterReloadValue(data & 0x7F);
        break;

      case 0x400A:
        this.triangleChannel.setReloadValue((this.triangleChannel.getSequencerReload() & 0xFF00) | data);
        break;

      case 0x400B:
        this.triangleChannel.setReloadValue(((data & 0x07) << 8) | (this.triangleChannel.getSequencerReload() & 0x00FF));
        this.triangleChannel.reloadTimer();
        this.triangleChannel.setSequence();   // Here?
        if (this.triangleChannel.isEnabled()) {
          this.triangleChannel.setCounter((data & 0xF8) >> 3);
        }
        this.triangleChannel.setReloadLinear();
        break;



        /*
           *********
           | Noise |
           *********
       */

      case 0x400C:
        this.noiseChannel.setVolume(data & 0x0F);
        this.noiseChannel.disableEnvelope(data & 0x10);
        this.noiseChannel.setHalt(data & 0x20);
        break;

      case 0x400E:
        this.noiseChannel.setTonal(data & 0x80);
        this.noiseChannel.setReload(data & 0x0F);
        break;

      case 0x400F:
        this.noiseChannel.startEnvelope();
        if (this.noiseChannel.isEnabled()) {
          this.noiseChannel.setCounter((data & 0xF8) >> 3);
        }
        break;



                /*
                   *********
                   |  DMC  |
                   *********
                */

      case 0x4010:
        this.deltaModulationChannel.setIrqEnabled(data & 0x80);
        this.deltaModulationChannel.setLoop(data & 0x40);
        this.deltaModulationChannel.setRateIndex(data & 0x0F);
        break;

      case 0x4011:
        this.deltaModulationChannel.setLoadCounter(data & 0x7F);
        break;

      case 0x4012:
        this.deltaModulationChannel.setSampleAddress(data);
        break;

      case 0x4013:
        this.deltaModulationChannel.setSampleLength(data);
        break;

      case 0x5001:
        this.deltaModulationChannel.setAllSamples(data);
        break;



      /*
         ***************************
         | Enable/Disable Channels |
         ***************************
     */

      case 0x4015:
        this.squareChannel1.setEnable(data & 0x01);
        this.squareChannel2.setEnable(data & 0x02);
        this.triangleChannel.setEnable(data & 0x04);
        this.noiseChannel.setEnable(data & 0x08);
        this.deltaModulationChannel.setEnabled(data & 0x10);

        this.deltaModulationChannel.clearInterrupt();

        if (!this.squareChannel1.isEnabled()) {
          this.squareChannel1.clearCounter();
        }
        if (!this.squareChannel2.isEnabled()) {
          this.squareChannel2.clearCounter();
        }
        if (!this.triangleChannel.isEnabled()) {
          this.triangleChannel.clearCounter();
        }
        if (!this.noiseChannel.isEnabled()) {
          this.noiseChannel.clearCounter();
        }
        if (!this.deltaModulationChannel.isEnabled()) {
          this.deltaModulationChannel.clearBytesRemaining();
        } else {
          if (!this.deltaModulationChannel.hasBytesRemaining()) {
            this.deltaModulationChannel.setNextSampleAddress();
            this.deltaModulationChannel.setBytesRemaining();
          }
        }
        break;

      case 0x4017:
        break;

      case 0x5000:
        if (data === 'reset') {
          this.reset();
        }
        break;
    }
  }

  read(address) {
    return 0x00;
  }

  reset() {
    this.triangleChannel.reset();
    this.noiseChannel.reset();
    this.squareChannel2.reset();
    this.squareChannel1.reset();
    this.deltaModulationChannel.reset();
    this.globalTime = 0.0;
    this.frameClockCounter[0] = 0x00000000;
    this.clockCounter[0] = 0x00000000;
    this.square1Output = 0.0;
    this.square2Output = 0.0;
    this.triangleOutput = 0.0;
    this.noiseOutput = 0.0;
    this.dmcOutput = 0.0;
  }
}

