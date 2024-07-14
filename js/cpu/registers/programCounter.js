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

  set(address) {
    this.programCounter.set(address);
  }

  increment() {
    this.programCounter.set(this.programCounter.get() + 1);
  }

  decrement() {
    this.programCounter.set(this.programCounter.get() - 1);
  }

  reset(vector) {
    this.programCounter = new Register16Bits();
    this.programCounter.set(vector);
  }
}
