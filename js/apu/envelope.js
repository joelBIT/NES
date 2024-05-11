
/**
 * Envelope describes how the sound changes over time.
 */
export class Envelope {
  start = false;
  disable = false;
  dividerCount = new Uint16Array(1);
  volume = new Uint16Array(1);
  output = new Uint16Array(1);
  decayCount = new Uint16Array(1);

  clock(loop) {
    if (!this.start) {
      if (this.dividerCount[0] === 0) {
        this.dividerCount[0] = this.volume[0];

        if (this.decayCount[0] === 0) {
          if (loop) {
            this.decayCount[0] = 15;
          }

        } else {
          this.decayCount[0]--;
        }
      } else {
        this.dividerCount[0]--;
      }
    } else {
      this.start = false;
      this.decayCount[0] = 15;
      this.dividerCount[0] = this.volume[0];
    }
    if (this.disable) {
      this.output[0] = this.volume[0];
    } else {
      this.output[0] = this.decayCount[0];
    }
  }
}
