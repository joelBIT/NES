
/**
 * Envelope describes how the sound changes over time. The NES APU has an envelope generator that controls the volume in
 * one of two ways: it can generate a decreasing saw envelope with optional looping, or it can generate a constant volume.
 *
 *                                             Loop flag
 *                                                  |
 *                         Start flag  +--------.   |   Constant volume
 *                                     |        |   |        flag
 *                                     v        v   v          |
 *          Quarter frame clock --> Divider --> Decay --> |    |
 *                                     ^        level     |    v
 *                                     |                  | Select --> Envelope output
 *                                     |                  |
 *                  Envelope parameter +----------------> |
 *
 */
export class Envelope {
  started = false;
  disabled = false;
  dividerCount = new Uint16Array(1);
  volume = new Uint16Array(1);
  output = new Uint16Array(1);
  decayCount = new Uint16Array(1);

  setVolume(volume) {
    this.volume[0] = volume;
  }

  getOutput() {
    return this.output[0];
  }

  start() {
    this.started = true;
  }

  setDisable(disable) {
    this.disabled = disable;
  }

  clock(channelHalted) {
    if (!this.started) {
      if (this.dividerCount[0] === 0) {
        this.dividerCount[0] = this.volume[0];

        if (this.decayCount[0] === 0) {
          if (channelHalted) {
            this.decayCount[0] = 15;
          }
        } else {
          this.decayCount[0]--;
        }
      } else {
        this.dividerCount[0]--;
      }
    } else {
      this.started = false;
      this.decayCount[0] = 15;
      this.dividerCount[0] = this.volume[0];
    }
    if (this.disabled) {
      this.output[0] = this.volume[0];
    } else {
      this.output[0] = this.decayCount[0];
    }
  }

  reset() {
    this.started = false;
    this.disabled = false;
    this.dividerCount[0] = 0x0000;
    this.volume[0] = 0x0000;
    this.output[0] = 0x0000;
    this.decayCount[0] = 0x0000;
  }
}
