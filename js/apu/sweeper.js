
/**
 * Sweeper produces a continuous bend from one pitch to another. An NES APU sweep unit can be made to periodically
 * adjust a pulse channel's period up or down.
 */
export class Sweeper {
  enabled = false;
  negate = false;
  reload = false;
  shift = 0x00;
  timer = 0x00;
  period = 0x00;
  change = new Uint16Array(1);
  muted = false;

  /**
   * Initializes this Sweeper.
   *
   *  76543210
   *  ||||||||
   *  |||||+++--  Shift count. If 0, then behaves like E=0 (enabled = false)
   *  ||||+-----  Negate flag (false: add to period, sweeping toward lower frequencies; true: subtract from period, sweeping toward higher frequencies)
   *  |+++------  The divider's period is P + 1 half-frames
   *  +---------  Enabled flag
   *
   * @param data    the byte containing the initialization bits.
   */
  setup(data) {
    this.enabled = data & 0x80;
    this.period = (data & 0x70) >> 4;
    this.negate = data & 0x08;
    this.shift = data & 0x07;
    this.reload = true;
  }

  /**
   * Muting means that the pulse channel sends 0 to the mixer instead of the current volume.
   *
   * @returns {boolean}   true if pulse channel should send 0 to the mixer, false otherwise
   */
  isMuted() {
    return this.muted;
  }

  track(target) {
    if (this.enabled) {
      this.change[0] = target >> this.shift;
      this.muted = (target < 8) || (target > 0x7FF);
    }
  }

  /**
   * Calculates the target period for a given channel.
   *
   * @param target        the current reload value of the sequencer
   * @param channel       the channel invoking this method
   * @returns {*}         the target period for the sequencer
   */
  clock(target, channel = 0) {
    if (this.timer === 0 && this.enabled && this.shift > 0 && !this.muted) {
      if (target >= 8 && this.change[0] < 0x07FF) {
        if (this.negate) {
          channel = channel === 1 ? 1 : 0;      // Only channel 1 should subtract 1 from change[0]
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

    return target;
  }

  reset() {
    this.enabled = false;
    this.negate = false;
    this.reload = false;
    this.shift = 0x00;
    this.timer = 0x00;
    this.period = 0x00;
    this.change[0] = 0x0000;
    this.muted = false;
  }
}
