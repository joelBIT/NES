/**
 * Length Counter
 */
export class LengthCounter {
  counter = new Uint8Array(1);
  lengthTable = [10, 254, 20,  2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30 ];
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
}
