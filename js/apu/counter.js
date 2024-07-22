/**
 * Length Counter. When the length counter reaches zero, the channel is silenced.
 * The triangle channel has an additional linear counter unit which is clocked four times per sequence (like the
 * envelope of the other channels). It functions independently of the length counter, and will also silence the
 * triangle channel when it reaches zero.
 */
export class LengthCounter {
  counter = new Uint8Array(1);
  lengthTable = [10, 254, 20,  2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30];
  halted = false;

  clock(enable) {
    if (!enable) {
      this.counter[0] = 0x00;
    } else {
      if (this.counter[0] > 0 && !this.halted) {
        this.counter[0]--;
      }
    }
  }

  setCounter(index) {
    this.counter[0] = this.lengthTable[index];
  }

  /**
   * Use this method to set any counter value. This way it is possible to use other lengths than those given in the lengthTable.
   * Uses the 7-bit value written to $4008 directly instead of a lookup table.
   *
   * @param value       the desired counter value
   */
  setCustomCounter(value) {
    this.counter[0] = value;
  }

  getCounter() {
    return this.counter[0];
  }

  decrementCounter() {
    this.counter[0]--;
  }

  setHalt(halt) {
    this.halted = halt;
  }

  clear() {
    this.counter[0] = 0;
  }

  reset() {
    this.counter[0] = 0;
    this.halted = false;
  }
}
