/**
 * Length Counter
 */
export class LengthCounter {
  counter = 0x00;

  clock(enable, halt) {
    if (!enable) {
      this.counter = 0;
    } else {
      if (this.counter > 0 && !halt) {
        this.counter--;
      }
    }
    return this.counter;
  }
}
