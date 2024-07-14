import { Register8Bits } from "../registers.js";

/**
 *  Used to store arithmetic and logic results such as addition and subtraction. Useful as a temporary storage area
 *  when moving data from one memory location to another.
 */
export class Accumulator {
  accumulator = new Register8Bits();

  get() {
    return this.accumulator.get();
  }

  set(value) {
    this.accumulator.set(value);
  }

  reset() {
    this.accumulator = new Register8Bits();
    this.accumulator.set(0x00);
  }
}
