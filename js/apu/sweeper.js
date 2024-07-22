
/**
 * Sweeper produces a continuous bend from one pitch to another. An NES APU sweep unit can be made to periodically
 * adjust a pulse channel's period up or down.
 */
export class Sweeper {
  enabled = false;
  down = false;
  reload = false;
  shift = 0x00;
  timer = 0x00;
  period = 0x00;
  change = new Uint16Array(1);
  muted = false;

  /**
   * Initializes this Sweeper.
   *
   * @param data    the byte containing the initialization bits.
   */
  setup(data) {
    this.enabled = data & 0x80;
    this.period = (data & 0x70) >> 4;
    this.down = data & 0x08;
    this.shift = data & 0x07;
    this.reload = true;
  }

  isMuted() {
    return this.muted;
  }

  track(target) {
    if (this.enabled) {
      this.change[0] = target >> this.shift;
      this.muted = (target < 8) || (target > 0x7FF);
    }
  }

  clock(target, channel) {
    if (this.timer === 0 && this.enabled && this.shift > 0 && !this.muted) {
      if (target >= 8 && this.change[0] < 0x07FF) {
        if (this.down) {
          target -= this.change[0] - channel;
        } else {
          target += this.change[0];
        }
      }
    }

    if (this.timer === 0 || this.reload) {
      this.timer = this.period;
      this.reload = false;
    } else {
      this.timer--;
    }
    this.muted = (target < 8) || (target > 0x7FF);
  }

  reset() {
    this.enabled = false;
    this.down = false;
    this.reload = false;
    this.shift = 0x00;
    this.timer = 0x00;
    this.period = 0x00;
    this.change[0] = 0x0000;
    this.muted = false;
  }
}
