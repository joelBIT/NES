import { Register8Bits } from "../registers.js";

/**
 * The register holds 8 flags (bit 0 - 7). The flags are used by the processor when performing operations.
 * On the NES, decimal mode (bit 3) is disabled and so this flag has no effect.
 *
 * 7  bit  0
 * ---- ----
 * NV1B DIZC
 * |||| ||||
 * |||| |||+- Carry
 * |||| ||+-- Zero
 * |||| |+--- Interrupt Disable
 * |||| +---- Decimal
 * |||+------ (No CPU effect)
 * ||+------- (No CPU effect; always pushed as 1)
 * |+-------- Overflow
 * +--------- Negative
 *
 */
export class StatusRegister {
  statusRegister = new Register8Bits();

  get() {
    return this.statusRegister.get();
  }

  set(status) {
    this.statusRegister.set(status);
  }

  getFlag(flag) {
    return (this.statusRegister.get() & flag) > 0 ? 1 : 0;
  }

  setFlag(flag) {
    this.statusRegister.set(this.statusRegister.get() | flag);
  }

  clearFlag(flag) {
    this.statusRegister.set(this.statusRegister.get() & ~flag);
  }

  reset(status) {
    this.statusRegister = new Register8Bits();
    this.statusRegister.set(status);
  }
}
