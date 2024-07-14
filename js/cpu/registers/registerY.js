import { Register8Bits } from "../registers.js";

/**
 * Used primarily as a counter in loops, or for addressing memory, but can also temporarily
 * store data like the accumulator.
 */
export class RegisterY {
  registerY = new Register8Bits();

  get() {
    return this.registerY.get();
  }

  set(value) {
    this.registerY.set(value);
  }

  reset() {
    this.registerY = new Register8Bits();
    this.registerY.set(0x00);
  }
}
