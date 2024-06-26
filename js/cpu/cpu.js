import { UnofficialOperations, OfficialOperations } from "./operations.js";
import { Flags } from "./flags.js";
import { Instruction, AddressMode } from "./instruction.js";
import { Register8Bits, Register16Bits } from "./registers.js";

/**
 * 16-bit Address Space and 8-bit Data Space. The CPU communicates with a Bus.
 */
class CPU {
  instructions = new Map();
  accumulator = new Register8Bits();
  registerX = new Register8Bits();
  registerY = new Register8Bits();
  stackPointer = new Register8Bits();
  statusRegister = new Register8Bits();
  programCounter = new Register16Bits();

  // Helper Registers used in this specific emulator
  fetched = new Register8Bits();
  operationCode = new Register8Bits();
  absoluteAddress = new Register16Bits();
  relativeAddress = new Register16Bits();
  tempValue = new Register16Bits();
  tempLow = new Register16Bits();
  tempHigh = new Register16Bits();

  // The current number of cycles left when executing an instruction
  cycles = 0;

  constructor() {
    this.createInstructions();
  }

  connectBus(bus) {
    this.bus = bus;
  }

  incrementPC() {
    this.programCounter.set(this.programCounter.get() + 1);
  }

  decrementPC() {
    this.programCounter.set(this.programCounter.get() - 1);
  }

  incrementSP() {
    this.stackPointer.set(this.stackPointer.get() + 1);
  }

  decrementSP() {
    this.stackPointer.set(this.stackPointer.get() - 1);
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

  /**
   *  Fetches an instruction's data from a location pointed to by the absolute address.
   *  Addressing mode IMP does not have anything to fetch because those operations have no operand.
   */
  fetch() {
    if (!this.instructions.get(this.operationCode.get()).addressMode.name.includes("IMP")) {
      this.fetched.set(this.read(this.absoluteAddress.get()));
    }
  }

  /**
   * One invocation of this method fetches and executes an instruction.
   */
  clock() {
    if (this.cycles === 0) {

      this.operationCode.set(this.read(this.programCounter.get()));
      this.setFlag(Flags.U);
      this.incrementPC();

      const instruction = this.instructions.get(this.operationCode.get());
      this.cycles = instruction.cycles;

      const additionalCycle1 = instruction.addressMode.operation();

      const additionalCycle2 = instruction.operation();

      this.cycles += (additionalCycle1 & additionalCycle2);
      this.setFlag(Flags.U);
    }
    while (this.cycles !== 0) {
      this.cycles--;
    }
  }

  createInstructions() {
    for (const opcode in OfficialOperations) {
      OfficialOperations[opcode].forEach(operation => {
        this.instructions.set(operation.opcode, new Instruction(opcode, operation.cycles, this[opcode].bind(this),
          new AddressMode(operation.addressMode, this[operation.addressMode].bind(this))));
      });
    }

    for (const opcode in UnofficialOperations) {
      UnofficialOperations[opcode].forEach(operation => {
        this.instructions.set(operation.opcode, new Instruction(opcode, operation.cycles, this[opcode].bind(this),
          new AddressMode(operation.addressMode, this[operation.addressMode].bind(this))));
      });
    }
  }

  /*
    ====================
    | ADDRESSING MODES |
    ====================
    Instructions that use the Implied addressing mode are always one byte long because they
    have no operand. The rest of the addressing modes need an operand to specify the byte of data to operate on.
   */

  /**
   *  Address Mode: Absolute
   */
  ABS() {
    this.tempLow.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.tempHigh.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.absoluteAddress.set((this.tempHigh.get() << 8) | this.tempLow.get());

    return 0;
  }

  /**
   *  Address Mode: Indexed Absolute X
   */
  ABX() {
    let address = this.read(this.programCounter.get());
    this.incrementPC();

    address |= (this.read(this.programCounter.get()) << 8);
    this.incrementPC();

    this.absoluteAddress.set(address + this.registerX.get());

    return 0;
  }

  /**
   *  Address Mode: Indexed Absolute Y
   */
  ABY() {
    this.tempLow.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.tempHigh.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.absoluteAddress.set(((this.tempHigh.get() << 8) | this.tempLow.get()) + this.registerY.get());

    return ((this.absoluteAddress.get() & 0xFF00) !== (this.tempHigh.get() << 8)) ? 1 : 0;
  }

  /**
   * Address Mode: Immediate
   */
  IMM() {
    this.absoluteAddress.set(this.programCounter.get());
    this.incrementPC();
    return 0;
  }

  /**
   *  Address Mode: Implied
   */
  IMP() {
    this.fetched.set(this.accumulator.get());
    return 0;
  }

  /**
   *  Address Mode: Indirect
   */
  IND() {
    this.tempLow.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.tempHigh.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.tempValue.set((this.tempHigh.get() << 8) | this.tempLow.get());

    if (this.tempLow.get() === 0x00FF) {    // Simulate page boundary hardware bug
      this.absoluteAddress.set((this.read(this.tempValue.get() & 0xFF00) << 8) | this.read(this.tempValue.get()));
    } else {
      this.absoluteAddress.set((this.read(this.tempValue.get() + 1) << 8) | this.read(this.tempValue.get()));
    }

    return 0;
  }

  /**
   *  Address Mode: Indexed Indirect
   */
  IZX() {
    this.tempValue.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.tempLow.set(this.read((this.tempValue.get() + this.registerX.get()) & 0x00FF));
    this.tempHigh.set(this.read((this.tempValue.get() + this.registerX.get() + 1) & 0x00FF));

    this.absoluteAddress.set((this.tempHigh.get() << 8) | this.tempLow.get());
    return 0;
  }

  /**
   *  Address Mode: Indirect Indexed
   */
  IZY() {
    this.tempValue.set(this.read(this.programCounter.get()));
    this.incrementPC();

    this.tempLow.set(this.read((this.tempValue.get() & 0x00FF)));
    this.tempHigh.set(this.read((this.tempValue.get() + 1) & 0x00FF));

    this.absoluteAddress.set(((this.tempHigh.get() << 8) | this.tempLow.get()) + this.registerY.get());

    return ((this.absoluteAddress.get() & 0xFF00) !== (this.tempHigh.get() << 8)) ? 1 : 0;
  }

  /**
   *  Address Mode: Relative
   */
  REL() {
    this.relativeAddress.set(this.read(this.programCounter.get()));
    this.incrementPC();
    if (this.relativeAddress.get() & 0x80) {
      this.relativeAddress.set(this.relativeAddress.get() | 0xFF00);
    }

    return 0;
  }

  /**
   *  Address Mode: Zero Page
   */
  ZP0() {
    this.absoluteAddress.set((this.read(this.programCounter.get())) & 0x00FF);
    this.incrementPC();

    return 0;
  }

  /**
   *  Address Mode: Indexed Zero Page X
   */
  ZPX() {
    this.absoluteAddress.set((this.read(this.programCounter.get()) + this.registerX.get()) & 0x00FF);
    this.incrementPC();

    return 0;
  }

  /**
   *  Address Mode: Indexed Zero Page Y
   */
  ZPY() {
    this.absoluteAddress.set((this.read(this.programCounter.get()) + this.registerY.get()) & 0x00FF);
    this.incrementPC();

    return 0;
  }

  /**
   *  Writes 8-bit data to a 16-bit address on the bus.
   */
  write(address, data) {
    this.bus.write(address, data);
  }

  /**
   *  Reads a 16-bit address on the bus and receives 8-bit data.
   */
  read(address) {
    return this.bus.read(address);
  }

  /*
    ======================
    | Interrupt handling |
    ======================
    Methods reset(), irq(), and nmi() interrupt the CPU from doing what it is currently doing. However,
    the CPU will finish the current instruction it is executing.
   */

  /**
   *  Reset interrupts are triggered when the system first starts and when the user presses the reset button.
   */
  reset() {
    this.programCounter.set((this.read(0xFFFD) << 8) | this.read(0xFFFC));
    this.accumulator.set(0x00);
    this.registerX.set(0x00);
    this.registerY.set(0x00);
    this.stackPointer.set(0xFD);
    this.statusRegister.set(0x00 | Flags.U);
    this.fetched.set(0x00);
    this.absoluteAddress.set(0x0000);
    this.relativeAddress.set(0x0000);

    this.cycles = 8;
  }

  /**
   *  Interrupt request signal - interrupts are enabled when flag I is set to 0 in the Status Register.
   *  These maskable interrupts are generated by certain memory mappers.
   */
  irq() {
    if (this.getFlag(Flags.I) === 0) {
      this.write(0x0100 + this.stackPointer.get(), (this.programCounter.get() >> 8) & 0x00FF);
      this.decrementSP();
      this.write(0x0100 + this.stackPointer.get(), this.programCounter.get() & 0x00FF);
      this.decrementSP();

      this.clearFlag(Flags.B);
      this.setFlag(Flags.U);
      this.setFlag(Flags.I);
      this.write(0x0100 + this.stackPointer.get(), this.statusRegister.get());
      this.decrementSP();

      this.absoluteAddress.set(0xFFFE);
      this.programCounter.set((this.read(0xFFFF) << 8) | this.read(0xFFFE));

      this.cycles = 7;
    }
  }

  /**
   *  Non-maskable interrupt signal - may be invoked at any time, regardless of flag I. This type of interrupt is
   *  generated by the PPU when V-Blank occurs at the end of each frame.
   */
  nmi() {
    this.write(0x0100 + this.stackPointer.get(), (this.programCounter.get() >> 8) & 0x00FF);
    this.decrementSP();
    this.write(0x0100 + this.stackPointer.get(), this.programCounter.get() & 0x00FF);
    this.decrementSP();

    this.clearFlag(Flags.B);
    this.setFlag(Flags.U);
    this.setFlag(Flags.I);
    this.write(0x0100 + this.stackPointer.get(), this.statusRegister.get());
    this.decrementSP();

    this.absoluteAddress.set(0xFFFA);
    this.programCounter.set((this.read(0xFFFB) << 8) | this.read(0xFFFA));

    this.cycles = 8;
  }

  /*
  ====================
  |    Operations    |
  ====================
   */

  /**
   * ADC   Add memory to Accumulator with Carry. Adds three values together: the current value in the Accumulator,
   *       the byte value specified by the operand, and the Carry flag.
   */
  ADC() {
    this.fetch();
    this.tempValue.set(this.accumulator.get() + this.fetched.get() + this.getFlag(Flags.C));

    this.tempValue.get() > 255 ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);

    (~(this.accumulator.get() ^ this.fetched.get()) & (this.accumulator.get() ^ this.tempValue.get())) & 0x0080 ? this.setFlag(Flags.V) : this.clearFlag(Flags.V);

    this.tempValue.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);
    this.accumulator.set(this.tempValue.get() & 0x00FF);

    return 1;
  }

  /**
   * AND   "AND" memory with Accumulator
   */
  AND() {
    this.fetch();

    this.accumulator.set(this.accumulator.get() & this.fetched.get());
    this.accumulator.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.accumulator.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 1;
  }

  /**
   * ASL   Shift left one bit (Memory or Accumulator)
   */
  ASL() {
    this.fetch();

    this.tempValue.set(this.fetched.get() << 1);
    (this.tempValue.get() & 0xFF00) > 0 ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    if (this.instructions.get(this.operationCode.get()).addressMode.name.includes("IMP")) {
      this.accumulator.set(this.tempValue.get() & 0x00FF);
    } else {
      this.write(this.absoluteAddress.get(), this.tempValue.get() & 0x00FF);
    }

    return 0;
  }

  /**
   * BCC   Branch on Carry Clear. Only branches if the Carry flag is not set.
   */
  BCC() {
    if (!this.getFlag(Flags.C)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   * BCS   Branch on Carry Set. Only branches if the Carry flag is set.
   */
  BCS() {
    if (this.getFlag(Flags.C)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   * BEQ   Branch on Result Zero. Only branches if the Zero flag is set.
   */
  BEQ() {
    if (this.getFlag(Flags.Z)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   * BIT   Test Bits in memory with accumulator
   */
  BIT() {
    this.fetch();

    this.tempValue.set(this.accumulator.get() & this.fetched.get());
    (this.tempValue.get() & 0x00FF) === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.fetched.get() & (1 << 7) ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);
    this.fetched.get() & (1 << 6) ? this.setFlag(Flags.V) : this.clearFlag(Flags.V);

    return 0;
  }

  /**
   * BMI   Branch on result minus. Only branches if the Negative flag is set.
   */
  BMI() {
    if (this.getFlag(Flags.N)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   * BNE   Branch on result not zero. Only branches if the Zero flag is not set.
   */
  BNE() {
    if (!this.getFlag(Flags.Z)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   *  BPL   Branch on result plus. Only branches if the Negative flag is not set.
   */
  BPL() {
    if (!this.getFlag(Flags.N)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   * BRK   Force Break. Saves the current values of the Processor Status register and Program Counter
   *       to the call stack. Transfers control to the IRQ/BRK vector.
   */
  BRK() {
    this.write(0x0100 + this.stackPointer.get(), (this.programCounter.get() >> 8) & 0x00FF);

    this.decrementSP();
    this.write(0x0100 + this.stackPointer.get(), this.programCounter.get() & 0x00FF);
    this.decrementSP();

    this.setFlag(Flags.B);
    this.write(0x0100 + this.stackPointer.get(), this.statusRegister.get());
    this.decrementSP();
    this.clearFlag(Flags.B);
    this.setFlag(Flags.I);

    this.programCounter.set(this.read(0xFFFE) | (this.read(0xFFFF) << 8));

    return 0;
  }

  /**
   * BVC   Branch on Overflow Clear. Only branches if the Overflow flag is not set.
   */
  BVC() {
    if (!this.getFlag(Flags.V)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   * BVS   Branch on Overflow Set. Only branches if the Overflow flag is set.
   */
  BVS() {
    if (this.getFlag(Flags.V)) {
      this.cycles++;
      this.absoluteAddress.set(this.programCounter.get() + this.relativeAddress.get());
      if ((this.absoluteAddress.get() & 0xFF00) !== (this.programCounter.get() & 0xFF00)) {
        this.cycles++;
      }
      this.programCounter.set(this.absoluteAddress.get());
    }

    return 0;
  }

  /**
   * CLC   Clear Carry Flag
   */
  CLC() {
    this.clearFlag(Flags.C);
    return 0;
  }

  /**
   * CLD   Clear Decimal Mode
   */
  CLD() {
    this.clearFlag(Flags.D);
    return 0;
  }

  /**
   * CLI   Clear Interrupt Disable Bit
   */
  CLI() {
    this.clearFlag(Flags.I);
    return 0;
  }

  /**
   * CLV   Clear Overflow Flag
   */
  CLV() {
    this.clearFlag(Flags.V);
    return 0;
  }

  /**
   * CMP   Compare Memory and Accumulator
   */
  CMP() {
    this.fetch();

    this.tempValue.set(this.accumulator.get() - this.fetched.get());
    this.accumulator.get() >= this.fetched.get() ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0x0000 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 1;
  }

  /**
   * CPX   Compare Memory and Register X
   */
  CPX() {
    this.fetch();

    this.tempValue.set(this.registerX.get() - this.fetched.get());
    this.registerX.get() >= this.fetched.get() ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0x0000 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * CPY   Compare Memory and Register Y
   */
  CPY() {
    this.fetch();

    this.tempValue.set(this.registerY.get() - this.fetched.get());
    this.registerY.get() >= this.fetched.get() ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0x0000 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * DEC   Decrement Memory by One
   */
  DEC() {
    this.fetch();

    this.tempValue.set(this.fetched.get() - 1);
    this.write(this.absoluteAddress.get(), this.tempValue.get() & 0x00FF);
    (this.tempValue.get() & 0x00FF) === 0x0000 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * DEX   Decrement Register X by One
   */
  DEX() {
    this.registerX.set(this.registerX.get() - 1);
    this.registerX.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerX.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * DEY   Decrement Register Y by One
   */
  DEY() {
    this.registerY.set(this.registerY.get() - 1);
    this.registerY.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerY.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * EOR   "Exclusive-OR" Memory with Accumulator
   */
  EOR() {
    this.fetch();

    this.accumulator.set(this.accumulator.get() ^ this.fetched.get());
    this.accumulator.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.accumulator.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 1;
  }

  /**
   * INC   Increment Memory by One
   */
  INC() {
    this.fetch();

    this.tempValue.set(this.fetched.get() + 1);
    this.write(this.absoluteAddress.get(), this.tempValue.get() & 0x00FF);
    (this.tempValue.get() & 0x00FF) === 0x0000 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * INX   Increment Register X by One
   */
  INX() {
    this.registerX.set(this.registerX.get() + 1);
    this.registerX.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerX.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * INY   Increment Register Y by One
   */
  INY() {
    this.registerY.set(this.registerY.get() + 1);
    this.registerY.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerY.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * JMP   Jump to new location. Sets the Program Counter to the memory location specified by the operand.
   */
  JMP() {
    this.programCounter.set(this.absoluteAddress.get());

    return 0;
  }

  /**
   * JSR   Jump to subroutine saving return address
   */
  JSR() {
    this.decrementPC();

    this.write(0x0100 + this.stackPointer.get(), (this.programCounter.get() >> 8) & 0x00FF);
    this.decrementSP();
    this.write(0x0100 + this.stackPointer.get(), this.programCounter.get() & 0x00FF);
    this.decrementSP();
    this.programCounter.set(this.absoluteAddress.get());

    return 0;
  }

  /**
   * LDA   Load Accumulator with Memory
   */
  LDA() {
    this.fetch();

    this.accumulator.set(this.fetched.get());
    this.accumulator.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.accumulator.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 1;
  }

  /**
   * LDX   Load Register X with Memory
   */
  LDX() {
    this.fetch();

    this.registerX.set(this.fetched.get());
    this.registerX.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerX.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 1;
  }

  /**
   * LDY   Load Register Y with Memory
   */
  LDY() {
    this.fetch();

    this.registerY.set(this.fetched.get());
    this.registerY.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerY.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 1;
  }

  /**
   * LSR   Shift One Bit Right (Memory or Accumulator)
   */
  LSR() {
    this.fetch();

    this.fetched.get() & 0x0001 ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    this.tempValue.set(this.fetched.get() >> 1);

    (this.tempValue.get() & 0x00FF) === 0x0000 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    if (this.instructions.get(this.operationCode.get()).addressMode.name.includes("IMP")) {
      this.accumulator.set(this.tempValue.get() & 0x00FF);
    } else {
      this.write(this.absoluteAddress.get(), this.tempValue.get() & 0x00FF);
    }

    return 0;
  }

  /**
   * NOP   No Operation
   */
  NOP() {
    switch (this.operationCode.get()) {
      case 0x1C:
      case 0x3C:
      case 0x5C:
      case 0x7C:
      case 0xDC:
      case 0xFC:
        return 1;
    }
    return 0;
  }

  /**
   * ORA   "OR" Memory with Accumulator
   */
  ORA() {
    this.fetch();
    this.accumulator.set(this.accumulator.get() | this.fetched.get());

    this.accumulator.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.accumulator.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 1;
  }

  /**
   * PHA   Push Accumulator on Stack
   */
  PHA() {
    this.write(0x0100 + this.stackPointer.get(), this.accumulator.get());
    this.decrementSP();

    return 0;
  }

  /**
   * PHP   Push Processor Status on Stack
   */
  PHP() {
    this.write(0x0100 + this.stackPointer.get(), this.statusRegister.get() | Flags.B | Flags.U);

    this.clearFlag(Flags.B);
    this.clearFlag(Flags.U);
    this.decrementSP();

    return 0;
  }

  /**
   * PLA   Pull Accumulator from Stack
   */
  PLA() {
    this.incrementSP();
    this.accumulator.set(this.read(0x0100 + this.stackPointer.get()));

    this.accumulator.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.accumulator.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * PLP   Pull Processor Status from Stack
   */
  PLP() {
    this.incrementSP();
    this.statusRegister.set(this.read(0x0100 + this.stackPointer.get()));
    this.clearFlag(Flags.U);
    this.clearFlag(Flags.B);

    return 0;
  }

  /**
   * ROL   Rotate One Bit Left (Memory or Accumulator)
   */
  ROL() {
    this.fetch();

    this.tempValue.set((this.fetched.get() << 1) | this.getFlag(Flags.C));
    this.tempValue.get() & 0xFF00 ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0x0000 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    if (this.instructions.get(this.operationCode.get()).addressMode.name.includes("IMP")) {
      this.accumulator.set(this.tempValue.get() & 0x00FF);
    } else {
      this.write(this.absoluteAddress.get(), this.tempValue.get() & 0x00FF);
    }

    return 0;
  }

  /**
   * ROR   Rotate One Bit Right (Memory or Accumulator)
   */
  ROR() {
    this.fetch();

    this.tempValue.set((this.getFlag(Flags.C) << 7) | (this.fetched.get() >> 1));
    this.fetched.get() & 0x01 ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    if (this.instructions.get(this.operationCode.get()).addressMode.name.includes("IMP")) {
      this.accumulator.set(this.tempValue.get() & 0x00FF);
    } else {
      this.write(this.absoluteAddress.get(), this.tempValue.get() & 0x00FF);
    }

    return 0;
  }

  /**
   * RTI   Return from Interrupt. Pops the topmost byte from the stack and uses it to update the
   *       Processor Status register, then pops the next two bytes from the stack and uses them to
   *       update the Program Counter.
   */
  RTI() {
    this.incrementSP();

    this.statusRegister.set((this.read(0x0100 + this.stackPointer.get())));
    this.statusRegister.set(this.statusRegister.get() & ~Flags.B);
    this.statusRegister.set(this.statusRegister.get() & ~Flags.U);

    this.incrementSP();
    let pc = this.read(0x0100 + this.stackPointer.get());
    this.incrementSP();
    this.programCounter.set(pc | (this.read(0x0100 + this.stackPointer.get()) << 8));

    return 0;
  }

  /**
   * RTS   Return from Subroutine
   */
  RTS() {
    this.incrementSP();
    this.programCounter.set(this.read(0x0100 + this.stackPointer.get()));
    this.incrementSP();
    this.programCounter.set(this.programCounter.get() | this.read(0x0100 + this.stackPointer.get()) << 8);
    this.incrementPC();

    return 0;
  }

  /**
   * SBC   Subtract Memory from Accumulator with Borrow. Subtracts the byte value specified by the operand from
   *       the current value in the Accumulator, taking any borrow into account.
   */
  SBC() {
    this.fetch();

    this.tempValue.set(this.accumulator.get() + (this.fetched.get() ^ 0x00FF) + this.getFlag(Flags.C));
    this.tempValue.get() & 0xFF00 ? this.setFlag(Flags.C) : this.clearFlag(Flags.C);
    (this.tempValue.get() & 0x00FF) === 0 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    ((this.tempValue.get() ^ this.accumulator.get()) & (this.tempValue.get() ^ (this.fetched.get() ^ 0x00FF)) & 0x0080) ? this.setFlag(Flags.V) : this.clearFlag(Flags.V);
    this.tempValue.get() & 0x0080 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);
    this.accumulator.set(this.tempValue.get() & 0x00FF);

    return 1;
  }

  /**
   * SEC   Set Carry Flag
   */
  SEC() {
    this.setFlag(Flags.C);
    return 0;
  }

  /**
   * SED   Set Decimal Mode
   */
  SED() {
    this.setFlag(Flags.D);
    return 0;
  }

  /**
   * SEI   Set Interrupt Disable Status
   */
  SEI() {
    this.setFlag(Flags.I);
    return 0;
  }

  /**
   * STA   Store Accumulator in Memory
   */
  STA() {
    this.write(this.absoluteAddress.get(), this.accumulator.get());

    return 0;
  }

  /**
   * STX   Store Register X in Memory
   */
  STX() {
    this.write(this.absoluteAddress.get(), this.registerX.get());

    return 0;
  }

  /**
   * STY   Store Register Y in Memory
   */
  STY() {
    this.write(this.absoluteAddress.get(), this.registerY.get());

    return 0;
  }

  /**
   * TAX   Transfer Accumulator to Register X
   */
  TAX() {
    this.registerX.set(this.accumulator.get());

    this.registerX.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerX.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * TAY   Transfer Accumulator to Register Y
   */
  TAY() {
    this.registerY.set(this.accumulator.get());

    this.registerY.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerY.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * TSX   Transfer Stack Pointer to Register X
   */
  TSX() {
    this.registerX.set(this.stackPointer.get());

    this.registerX.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.registerX.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * TXA   Transfer Register X to Accumulator
   */
  TXA() {
    this.accumulator.set(this.registerX.get());

    this.accumulator.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.accumulator.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * TXS   Transfer Register X to Stack Register
   */
  TXS() {
    this.stackPointer.set(this.registerX.get());
    return 0;
  }

  /**
   * TYA   Transfer Register Y to Accumulator
   */
  TYA() {
    this.accumulator.set(this.registerY.get());

    this.accumulator.get() === 0x00 ? this.setFlag(Flags.Z) : this.clearFlag(Flags.Z);
    this.accumulator.get() & 0x80 ? this.setFlag(Flags.N) : this.clearFlag(Flags.N);

    return 0;
  }

  /**
   * XXX   Capture Illegal Operation Codes
   */
  XXX() {
    return 0;
  }
}

export const cpu = new CPU();
