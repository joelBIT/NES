
/**
 * Sweeper produces a continuous bend from one pitch to another.
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

  setReload(reload) {
    this.reload = reload;
  }

  isMuted() {
    return this.muted;
  }

  setShift(shift) {
    this.shift = shift;
  }

  setEnable(enable) {
    this.enabled = enable;
  }

  setDown(down) {
    this.down = down;
  }

  setPeriod(period) {
    this.period = period;
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
