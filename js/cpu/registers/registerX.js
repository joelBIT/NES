import { Register8Bits } from "../registers.js";

/**
 * Used primarily as a counter in loops, or for addressing memory, but can also temporarily
 * store data like the accumulator.
 */
export class RegisterX {
  registerX = new Register8Bits();

  get() {
    return this.registerX.get();
  }

  set(value) {
    this.registerX.set(value);
  }

  reset() {
    this.registerX = new Register8Bits();
    this.registerX.set(0x00);
  }
}
