import { Register16Bits } from "../registers.js";

/**
 * The Program Counter (PC) stores the address of the next instruction to be executed. Instructions can be used to
 * update the value of the Program Counter to a particular address.
 * This register is two bytes in size because the Program Counter stores an address.
 */
export class ProgramCounter {
  programCounter = new Register16Bits();

  get() {
    return this.programCounter.get();
  }

  set(value) {
    this.programCounter.set(value);
  }

  incrementPC() {
    this.programCounter.set(this.programCounter.get() + 1);
  }

  decrementPC() {
    this.programCounter.set(this.programCounter.get() - 1);
  }
}
