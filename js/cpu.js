
/**
 * These are unofficial operations for the NES 2A03 CPU. Each operation contains information about cycles, addressing
 * mode, and corresponding operation code.
 */
const unofficialOperations = {
  "NOP": [ { addressMode: "ABS", opcode: 0x0C, cycles: 4 },
    { addressMode: "ABX", opcode: 0x3C, cycles: 4 },
    { addressMode: "ABX", opcode: 0x5C, cycles: 4 },
    { addressMode: "ABX", opcode: 0x7C, cycles: 4 },
    { addressMode: "ABX", opcode: 0xDC, cycles: 4 },
    { addressMode: "ABX", opcode: 0xFC, cycles: 4 },
    { addressMode: "ABX", opcode: 0x1C, cycles: 4 },
    { addressMode: "IMM", opcode: 0x89, cycles: 2 },
    { addressMode: "IMM", opcode: 0x80, cycles: 2 },
    { addressMode: "IMM", opcode: 0xC2, cycles: 2 },
    { addressMode: "IMM", opcode: 0xE2, cycles: 2 },
    { addressMode: "IMM", opcode: 0x82, cycles: 2 },
    { addressMode: "IMP", opcode: 0xEA, cycles: 2 },
    { addressMode: "IMP", opcode: 0x1A, cycles: 2 },
    { addressMode: "IMP", opcode: 0x3A, cycles: 2 },
    { addressMode: "IMP", opcode: 0x5A, cycles: 2 },
    { addressMode: "IMP", opcode: 0x7A, cycles: 2 },
    { addressMode: "IMP", opcode: 0xDA, cycles: 2 },
    { addressMode: "IMP", opcode: 0xFA, cycles: 2 },
    { addressMode: "ZP0", opcode: 0x04, cycles: 2 },
    { addressMode: "ZP0", opcode: 0x64, cycles: 3 },
    { addressMode: "ZP0", opcode: 0x44, cycles: 3 },
    { addressMode: "ZPX", opcode: 0x34, cycles: 4 },
    { addressMode: "ZPX", opcode: 0x54, cycles: 4 },
    { addressMode: "ZPX", opcode: 0x74, cycles: 4 },
    { addressMode: "ZPX", opcode: 0xD4, cycles: 4 },
    { addressMode: "ZPX", opcode: 0xF4, cycles: 4 },
    { addressMode: "ZPX", opcode: 0x14, cycles: 4 } ],
  "XXX": [ { addressMode: "ABS", opcode: 0x0F, cycles: 6 },
    { addressMode: "ABS", opcode: 0x2F, cycles: 6 },
    { addressMode: "ABS", opcode: 0x4F, cycles: 6 },
    { addressMode: "ABS", opcode: 0x6F, cycles: 6 },
    { addressMode: "ABS", opcode: 0x8F, cycles: 4 },
    { addressMode: "ABS", opcode: 0xAF, cycles: 4 },
    { addressMode: "ABS", opcode: 0xCF, cycles: 6 },
    { addressMode: "ABS", opcode: 0xEF, cycles: 6 },
    { addressMode: "ABX", opcode: 0x1F, cycles: 7 },
    { addressMode: "ABX", opcode: 0x3F, cycles: 7 },
    { addressMode: "ABX", opcode: 0x5F, cycles: 7 },
    { addressMode: "ABX", opcode: 0x7F, cycles: 7 },
    { addressMode: "ABX", opcode: 0xDF, cycles: 7 },
    { addressMode: "ABX", opcode: 0xFF, cycles: 7 },
    { addressMode: "ABX", opcode: 0x9E, cycles: 5 },
    { addressMode: "ABX", opcode: 0x9C, cycles: 5 },
    { addressMode: "ABY", opcode: 0x9F, cycles: 5 },
    { addressMode: "ABY", opcode: 0xBF, cycles: 4 },
    { addressMode: "ABY", opcode: 0x1B, cycles: 7 },
    { addressMode: "ABY", opcode: 0x3B, cycles: 7 },
    { addressMode: "ABY", opcode: 0x5B, cycles: 7 },
    { addressMode: "ABY", opcode: 0x7B, cycles: 7 },
    { addressMode: "ABY", opcode: 0x9B, cycles: 5 },
    { addressMode: "ABY", opcode: 0xBB, cycles: 4 },
    { addressMode: "ABY", opcode: 0xDB, cycles: 7 },
    { addressMode: "ABY", opcode: 0xFB, cycles: 7 },
    { addressMode: "IMM", opcode: 0x0B, cycles: 2 },
    { addressMode: "IMM", opcode: 0x2B, cycles: 2 },
    { addressMode: "IMM", opcode: 0x4B, cycles: 2 },
    { addressMode: "IMM", opcode: 0x6B, cycles: 2 },
    { addressMode: "IMM", opcode: 0x8B, cycles: 2 },
    { addressMode: "IMM", opcode: 0xAB, cycles: 2 },
    { addressMode: "IMM", opcode: 0xCB, cycles: 2 },
    { addressMode: "IMM", opcode: 0xEB, cycles: 2 },
    { addressMode: "IMP", opcode: 0x02, cycles: 2 },
    { addressMode: "IMP", opcode: 0x22, cycles: 2 },
    { addressMode: "IMP", opcode: 0x42, cycles: 2 },
    { addressMode: "IMP", opcode: 0x62, cycles: 2 },
    { addressMode: "IMP", opcode: 0x12, cycles: 2 },
    { addressMode: "IMP", opcode: 0x32, cycles: 2 },
    { addressMode: "IMP", opcode: 0x52, cycles: 2 },
    { addressMode: "IMP", opcode: 0x72, cycles: 2 },
    { addressMode: "IMP", opcode: 0x92, cycles: 2 },
    { addressMode: "IMP", opcode: 0xB2, cycles: 2 },
    { addressMode: "IMP", opcode: 0xD2, cycles: 2 },
    { addressMode: "IMP", opcode: 0xF2, cycles: 2 },
    { addressMode: "IZX", opcode: 0x23, cycles: 8 },
    { addressMode: "IZX", opcode: 0x43, cycles: 8 },
    { addressMode: "IZX", opcode: 0x63, cycles: 8 },
    { addressMode: "IZX", opcode: 0xC3, cycles: 8 },
    { addressMode: "IZX", opcode: 0xE3, cycles: 8 },
    { addressMode: "IZX", opcode: 0x83, cycles: 6 },
    { addressMode: "IZX", opcode: 0xA3, cycles: 8 },
    { addressMode: "IZX", opcode: 0x03, cycles: 8 },
    { addressMode: "IZY", opcode: 0x33, cycles: 8 },
    { addressMode: "IZY", opcode: 0x53, cycles: 8 },
    { addressMode: "IZY", opcode: 0x73, cycles: 8 },
    { addressMode: "IZY", opcode: 0xD3, cycles: 8 },
    { addressMode: "IZY", opcode: 0xF3, cycles: 8 },
    { addressMode: "IZY", opcode: 0x93, cycles: 6 },
    { addressMode: "IZY", opcode: 0xB3, cycles: 5 },
    { addressMode: "IZY", opcode: 0x13, cycles: 8 },
    { addressMode: "ZP0", opcode: 0x27, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x47, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x67, cycles: 5 },
    { addressMode: "ZP0", opcode: 0xC7, cycles: 5 },
    { addressMode: "ZP0", opcode: 0xE7, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x87, cycles: 3 },
    { addressMode: "ZP0", opcode: 0xA7, cycles: 3 },
    { addressMode: "ZP0", opcode: 0x07, cycles: 5 },
    { addressMode: "ZPX", opcode: 0x37, cycles: 6 },
    { addressMode: "ZPX", opcode: 0x57, cycles: 6 },
    { addressMode: "ZPX", opcode: 0x77, cycles: 6 },
    { addressMode: "ZPX", opcode: 0xD7, cycles: 6 },
    { addressMode: "ZPX", opcode: 0xF7, cycles: 6 },
    { addressMode: "ZPX", opcode: 0x97, cycles: 4 },
    { addressMode: "ZPX", opcode: 0xB7, cycles: 6 },
    { addressMode: "ZPX", opcode: 0x17, cycles: 6 } ]
};

/**
 * These are official operations for the NES 2A03 CPU. Each operation contains information about cycles, addressing
 * mode, and corresponding operation code.
 */
const officialOperations = {
  "ADC": [ { addressMode: "ABS", opcode: 0x6D, cycles: 4 },
    { addressMode: "ABX", opcode: 0x7D, cycles: 4 },
    { addressMode: "ABY", opcode: 0x79, cycles: 4 },
    { addressMode: "IMM", opcode: 0x69, cycles: 2 },
    { addressMode: "IZX", opcode: 0x61, cycles: 6 },
    { addressMode: "IZY", opcode: 0x71, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x65, cycles: 3 },
    { addressMode: "ZPX", opcode: 0x75, cycles: 4 } ],
  "AND": [ { addressMode: "ABS", opcode: 0x2D, cycles: 4 },
    { addressMode: "ABX", opcode: 0x3D, cycles: 4 },
    { addressMode: "ABY", opcode: 0x39, cycles: 4 },
    { addressMode: "IMM", opcode: 0x29, cycles: 2 },
    { addressMode: "IZX", opcode: 0x21, cycles: 6 },
    { addressMode: "IZY", opcode: 0x31, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x25, cycles: 3 },
    { addressMode: "ZPX", opcode: 0x35, cycles: 4 } ],
  "ASL": [ { addressMode: "ABS", opcode: 0x0E, cycles: 6 },
    { addressMode: "ABX", opcode: 0x1E, cycles: 7 },
    { addressMode: "IMP", opcode: 0x0A, cycles: 2 },
    { addressMode: "ZP0", opcode: 0x06, cycles: 5 },
    { addressMode: "ZPX", opcode: 0x16, cycles: 6 } ],
  "BCC": [ { addressMode: "REL", opcode: 0x90, cycles: 2 } ],
  "BCS": [ { addressMode: "REL", opcode: 0xB0, cycles: 2 } ],
  "BEQ": [ { addressMode: "REL", opcode: 0xF0, cycles: 2 } ],
  "BIT": [ { addressMode: "ABS", opcode: 0x2C, cycles: 4 },
    { addressMode: "ZP0", opcode: 0x24, cycles: 3 } ],
  "BMI": [ { addressMode: "REL", opcode: 0x30, cycles: 2 } ],
  "BNE": [ { addressMode: "REL", opcode: 0xD0, cycles: 2 } ],
  "BPL": [ { addressMode: "REL", opcode: 0x10, cycles: 2 } ],
  "BRK": [ { addressMode: "IMM", opcode: 0x00, cycles: 7 } ],
  "BVC": [ { addressMode: "REL", opcode: 0x50, cycles: 2 } ],
  "BVS": [ { addressMode: "REL", opcode: 0x70, cycles: 2 } ],
  "CLC": [ { addressMode: "IMP", opcode: 0x18, cycles: 2 } ],
  "CLD": [ { addressMode: "IMP", opcode: 0xD8, cycles: 2 } ],
  "CLI": [ { addressMode: "IMP", opcode: 0x58, cycles: 2 } ],
  "CLV": [ { addressMode: "IMP", opcode: 0xB8, cycles: 2 } ],
  "CMP": [ { addressMode: "ABS", opcode: 0xCD, cycles: 4 },
    { addressMode: "ABX", opcode: 0xDD, cycles: 4 },
    { addressMode: "ABY", opcode: 0xD9, cycles: 4 },
    { addressMode: "IMM", opcode: 0xC9, cycles: 2 },
    { addressMode: "IZX", opcode: 0xC1, cycles: 6 },
    { addressMode: "IZY", opcode: 0xD1, cycles: 5 },
    { addressMode: "ZP0", opcode: 0xC5, cycles: 3 },
    { addressMode: "ZPX", opcode: 0xD5, cycles: 4 } ],
  "CPY": [ { addressMode: "ABS", opcode: 0xCC, cycles: 4 },
    { addressMode: "IMM", opcode: 0xC0, cycles: 2 },
    { addressMode: "ZP0", opcode: 0xC4, cycles: 3 } ],
  "CPX": [ { addressMode: "ABS", opcode: 0xEC, cycles: 4 },
    { addressMode: "IMM", opcode: 0xE0, cycles: 2 },
    { addressMode: "ZP0", opcode: 0xE4, cycles: 3 } ],
  "DEC": [ { addressMode: "ABS", opcode: 0xCE, cycles: 6 },
    { addressMode: "ABX", opcode: 0xDE, cycles: 7 },
    { addressMode: "ZP0", opcode: 0xC6, cycles: 5 },
    { addressMode: "ZPX", opcode: 0xD6, cycles: 6 } ],
  "DEX": [ { addressMode: "IMP", opcode: 0xCA, cycles: 2 } ],
  "DEY": [ { addressMode: "IMP", opcode: 0x88, cycles: 2 } ],
  "EOR": [ { addressMode: "ABS", opcode: 0x4D, cycles: 4 },
    { addressMode: "ABX", opcode: 0x5D, cycles: 4 },
    { addressMode: "ABY", opcode: 0x59, cycles: 4 },
    { addressMode: "IMM", opcode: 0x49, cycles: 2 },
    { addressMode: "IZX", opcode: 0x41, cycles: 6 },
    { addressMode: "IZY", opcode: 0x51, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x45, cycles: 3 },
    { addressMode: "ZPX", opcode: 0x55, cycles: 4 } ],
  "INC": [ { addressMode: "ABS", opcode: 0xEE, cycles: 6 },
    { addressMode: "ABX", opcode: 0xFE, cycles: 7 },
    { addressMode: "ZP0", opcode: 0xE6, cycles: 5 },
    { addressMode: "ZPX", opcode: 0xF6, cycles: 6 } ],
  "INX": [ { addressMode: "IMP", opcode: 0xE8, cycles: 2 } ],
  "INY": [ { addressMode: "IMP", opcode: 0xC8, cycles: 2 } ],
  "JMP": [ { addressMode: "ABS", opcode: 0x4C, cycles: 3 },
    { addressMode: "IND", opcode: 0x6C, cycles: 5 } ],
  "JSR": [ { addressMode: "ABS", opcode: 0x20, cycles: 6 } ],
  "LDA": [ { addressMode: "ABS", opcode: 0xAD, cycles: 4 },
    { addressMode: "ABX", opcode: 0xBD, cycles: 4 },
    { addressMode: "ABY", opcode: 0xB9, cycles: 4 },
    { addressMode: "IMM", opcode: 0xA9, cycles: 2 },
    { addressMode: "IZX", opcode: 0xA1, cycles: 6 },
    { addressMode: "IZY", opcode: 0xB1, cycles: 5 },
    { addressMode: "ZP0", opcode: 0xA5, cycles: 3 },
    { addressMode: "ZPX", opcode: 0xB5, cycles: 4 } ],
  "LDX": [ { addressMode: "ABS", opcode: 0xAE, cycles: 4 },
    { addressMode: "ABY", opcode: 0xBE, cycles: 4 },
    { addressMode: "IMM", opcode: 0xA2, cycles: 2 },
    { addressMode: "ZP0", opcode: 0xA6, cycles: 3 },
    { addressMode: "ZPY", opcode: 0xB6, cycles: 4 } ],
  "LDY": [ { addressMode: "ABS", opcode: 0xAC, cycles: 4 },
    { addressMode: "ABX", opcode: 0xBC, cycles: 4 },
    { addressMode: "IMM", opcode: 0xA0, cycles: 2 },
    { addressMode: "ZP0", opcode: 0xA4, cycles: 3 },
    { addressMode: "ZPX", opcode: 0xB4, cycles: 4 } ],
  "LSR": [ { addressMode: "ABS", opcode: 0x4E, cycles: 6 },
    { addressMode: "ABX", opcode: 0x5E, cycles: 7 },
    { addressMode: "IMP", opcode: 0x4A, cycles: 2 },
    { addressMode: "ZP0", opcode: 0x46, cycles: 5 },
    { addressMode: "ZPX", opcode: 0x56, cycles: 6 } ],
  "ORA": [ { addressMode: "ABS", opcode: 0x0D, cycles: 4 },
    { addressMode: "ABX", opcode: 0x1D, cycles: 4 },
    { addressMode: "ABY", opcode: 0x19, cycles: 4 },
    { addressMode: "IMM", opcode: 0x09, cycles: 2 },
    { addressMode: "IZX", opcode: 0x01, cycles: 6 },
    { addressMode: "IZY", opcode: 0x11, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x05, cycles: 3 },
    { addressMode: "ZPX", opcode: 0x15, cycles: 4 } ],
  "PHA": [ { addressMode: "IMP", opcode: 0x48, cycles: 3 } ],
  "PHP": [ { addressMode: "IMP", opcode: 0x08, cycles: 3 } ],
  "PLA": [ { addressMode: "IMP", opcode: 0x68, cycles: 4 } ],
  "PLP": [ { addressMode: "IMP", opcode: 0x28, cycles: 4 } ],
  "ROL": [ { addressMode: "ABS", opcode: 0x2E, cycles: 6 },
    { addressMode: "ABX", opcode: 0x3E, cycles: 7 },
    { addressMode: "IMP", opcode: 0x2A, cycles: 2 },
    { addressMode: "ZP0", opcode: 0x26, cycles: 5 },
    { addressMode: "ZPX", opcode: 0x36, cycles: 6 } ],
  "ROR": [ { addressMode: "ABS", opcode: 0x6E, cycles: 6 },
    { addressMode: "ABX", opcode: 0x7E, cycles: 7 },
    { addressMode: "IMP", opcode: 0x6A, cycles: 2 },
    { addressMode: "ZP0", opcode: 0x66, cycles: 5 },
    { addressMode: "ZPX", opcode: 0x76, cycles: 6 } ],
  "RTI": [ { addressMode: "IMP", opcode: 0x40, cycles: 6 } ],
  "RTS": [ { addressMode: "IMP", opcode: 0x60, cycles: 6 } ],
  "SBC": [ { addressMode: "ABS", opcode: 0xED, cycles: 4 },
    { addressMode: "ABX", opcode: 0xFD, cycles: 4 },
    { addressMode: "ABY", opcode: 0xF9, cycles: 4 },
    { addressMode: "IMM", opcode: 0xE9, cycles: 2 },
    { addressMode: "IZX", opcode: 0xE1, cycles: 6 },
    { addressMode: "IZY", opcode: 0xF1, cycles: 5 },
    { addressMode: "ZP0", opcode: 0xE5, cycles: 3 },
    { addressMode: "ZPX", opcode: 0xF5, cycles: 4 } ],
  "SEC": [ { addressMode: "IMP", opcode: 0x38, cycles: 2 } ],
  "SED": [ { addressMode: "IMP", opcode: 0xF8, cycles: 2 } ],
  "SEI": [ { addressMode: "IMP", opcode: 0x78, cycles: 2 } ],
  "STA": [ { addressMode: "ABS", opcode: 0x8D, cycles: 4 },
    { addressMode: "ABX", opcode: 0x9D, cycles: 5 },
    { addressMode: "ABY", opcode: 0x99, cycles: 5 },
    { addressMode: "IZX", opcode: 0x81, cycles: 6 },
    { addressMode: "IZY", opcode: 0x91, cycles: 5 },
    { addressMode: "ZP0", opcode: 0x85, cycles: 3 },
    { addressMode: "ZPX", opcode: 0x95, cycles: 4 } ],
  "STX": [ { addressMode: "ABS", opcode: 0x8E, cycles: 4 },
    { addressMode: "ZP0", opcode: 0x86, cycles: 3 },
    { addressMode: "ZPY", opcode: 0x96, cycles: 4 } ],
  "STY": [ { addressMode: "ABS", opcode: 0x8C, cycles: 4 },
    { addressMode: "ZP0", opcode: 0x84, cycles: 3 },
    { addressMode: "ZPX", opcode: 0x94, cycles: 4 } ],
  "TAX": [ { addressMode: "IMP", opcode: 0xAA, cycles: 2 } ],
  "TAY": [ { addressMode: "IMP", opcode: 0xA8, cycles: 2 } ],
  "TYA": [ { addressMode: "IMP", opcode: 0x98, cycles: 2 } ],
  "TSX": [ { addressMode: "IMP", opcode: 0xBA, cycles: 2 } ],
  "TXA": [ { addressMode: "IMP", opcode: 0x8A, cycles: 2 } ],
  "TXS": [ { addressMode: "IMP", opcode: 0x9A, cycles: 2 } ]
};

/**
 *  Flags in the Status Register
 */
const Flags = Object.freeze({
  C: (1 << 0),                            //  Carry
  Z: (1 << 1),                            //  Zero
  I: (1 << 2),                            //  Disable Interrupts
  D: (1 << 3),                            //  Decimal Mode
  B: (1 << 4),                            //  Break
  U: (1 << 5),                            //  Unused
  V: (1 << 6),                            //  Overflow
  N: (1 << 7)                             //  Negative
});

/**
 * An instruction contains information for a CPU about how to perform a task.
 *
 * name: the instruction's operation code
 * cycles: the number of clock cycles required to finish execution
 * operation: the operation to be performed
 * addressMode: the addressing mode used in this instruction
 */
class Instruction {
  constructor(name, cycles, operation, addressMode) {
    this.name = name;
    this.cycles = cycles;
    this.operation = operation;
    this.addressMode = addressMode;
  }
}

/**
 * Addressing modes provide different ways to access memory locations. Some addressing modes operate on the
 * contents of registers, rather than memory.
 *
 * name: the name of the address mode
 * operation: the operation to be performed
 */
class AddressMode {
  constructor(name, operation) {
    this.name = name;
    this.operation = operation;
  }
}

/**
 * Facilitates the use of 8-bit addresses and values.
 */
class Register8Bits {
  register = new DataView(new ArrayBuffer(1));

  get() {
    return this.register.getUint8(0);
  }

  set(value) {
    this.register.setUint8(0, value);
  }
}

/**
 * Facilitates the use of 16-bit addresses and values.
 */
class Register16Bits {
  register = new DataView(new ArrayBuffer(2));

  get() {
    return this.register.getUint16(0);
  }

  set(value) {
    this.register.setUint16(0, value);
  }
}

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
    for (const opcode in officialOperations) {
      officialOperations[opcode].forEach(operation => {
        this.instructions.set(operation.opcode, new Instruction(opcode, operation.cycles, this[opcode].bind(this),
          new AddressMode(operation.addressMode, this[operation.addressMode].bind(this))));
      });
    }

    for (const opcode in unofficialOperations) {
      unofficialOperations[opcode].forEach(operation => {
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
    this.bus.cpuWrite(address, data);
  }

  /**
   *  Reads a 16-bit address on the bus and receives 8-bit data.
   */
  read(address) {
    return this.bus.cpuRead(address);
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
