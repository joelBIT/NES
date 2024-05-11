
/**
 * Sweeper
 */
export class Sweeper {
  enabled = false;
  down = false;
  reload = false;
  shift = 0x00;
  timer = 0x00;
  period = 0x00;
  change = new Uint16Array(1);
  mute = false;

  track(target) {
    if (this.enabled) {
      this.change[0] = target >> this.shift;
      this.mute = (target < 8) || (target > 0x7FF);
    }
  }

  clock(target, channel) {
    let changed = false;
    if (this.timer === 0 && this.enabled && this.shift > 0 && !this.mute) {
      if (target >= 8 && this.change[0] < 0x07FF) {
        if (this.down) {
          target -= this.change[0] - channel;
        } else {
          target += this.change[0];
        }
        changed = true;
      }
    }

    if (this.timer === 0 || this.reload) {
      this.timer = this.period;
      this.reload = false;
    } else {
      this.timer--;
    }
    this.mute = (target < 8) || (target > 0x7FF);

    return changed;
  }
}
