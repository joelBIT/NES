/**
 * A Sequencer is a counter that counts down when it is enabled and clocked. When the counter reaches -1 a function
 * is invoked, and the counter is reset. What this function does varies depending on which channel it is invoked for.
 * Using a sequencer the frequency of a wave can be altered. The sequencer for a square wave channel sets the frequency of
 * the output waveform and it sets the duty cycle.
 *
 * The purpose of the sequencer is to output a '1' after a given interval.
 */
export class Sequencer {
  sequence = new Uint32Array(1);
  newSequence = new Uint32Array(1);
  timer = new Uint16Array(1);
  reload = new Uint16Array(1);
  output = new Uint8Array(1);

  clock(enable, noise = false) {
    if (enable) {
      this.timer[0]--;
      if (this.timer[0] === 0xFFFF) {
        this.timer[0] = this.reload[0];
        if (noise) {
          this.sequence[0] = (((this.sequence[0] & 0x0001) ^ ((this.sequence[0] & 0x0002) >> 1)) << 14) | ((this.sequence[0] & 0x7FFF) >> 1);
        } else {
          this.sequence[0] = ((this.sequence[0] & 0x0001) << 7) | ((this.sequence[0] & 0x00FE) >> 1);
        }
        this.output[0] = this.sequence[0] & 0x00000001;
      }
    }
    return this.output[0];
  }
}
