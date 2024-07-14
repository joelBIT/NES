import { Register8Bits } from "../registers.js";

/**
 * The stack pointer hold the address to the current location on the stack.
 */
export class StackPointer {
  stackPointer = new Register8Bits();

  get() {
    return this.stackPointer.get();
  }

  set(address) {
    this.stackPointer.set(address);
  }

  increment() {
    this.stackPointer.set(this.stackPointer.get() + 1);
  }

  decrement() {
    this.stackPointer.set(this.stackPointer.get() - 1);
  }

  reset(address) {
    this.stackPointer = new Register8Bits();
    this.stackPointer.set(address);
  }
}
