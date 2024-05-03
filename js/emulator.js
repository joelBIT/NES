'use strict';

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

/**
 *  Mirror
 */
const Mirror = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  HARDWARE: "hardware",
  ONE_SCREEN_LOW: "one screen_low",
  ONE_SCREEN_HIGH: "one screen_high"
});

/**
 * A bus is used for communication between components such as CPU, Memory, and PPU.
 */
class Bus {
  cpuRAM = new Uint8Array(2048);
  systemClockCounter = new Uint32Array(1);
  controllers = new Uint8Array(2);            // Controllers
  controllerState = new Uint8Array(2);        // Internal cache of controller state

  dmaPage = new Uint8Array(1);              // This together with dmaAddress form a 16-bit address on the CPU's address bus, dmaPage is the low byte
  dmaAddress = new Uint8Array(1);
  dmaData = new Uint8Array(1);            // Represents the byte of data in transit from the CPU's memory to the OAM
  dmaTransfer = false;
  dmaDummy = true;

  // NES components
  cpu;
  ppu;
  cartridge;

  constructor(cpu, ppu) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.cpu.connectBus(this);
  }

  reset() {
    this.cartridge.reset();
    this.cpu.reset();
    this.ppu.reset();
    this.systemClockCounter[0] = 0;

    this.dmaPage[0] = 0x00;
    this.dmaAddress[0] = 0x00;
    this.dmaData[0] = 0x00;
    this.dmaDummy = true;
    this.dmaTransfer = false;
  }

  insertCartridge(cartridge) {
    this.cartridge = cartridge;
    this.ppu.connectCartridge(cartridge);
  }

  clock() {
    this.ppu.clock();
    if (this.systemClockCounter[0] % 3 === 0) {   // The CPU runs 3 times slower than the PPU so we only call its clock() function every 3 times this function is called
      if (this.dmaTransfer) {
        if (this.dmaDummy) {
          if (this.systemClockCounter[0] % 2 === 1) {
            this.dmaDummy = false;
          }
        } else {
          if (this.systemClockCounter[0] % 2 === 0) {
            this.dmaData[0] = this.cpuRead((this.dmaPage[0] << 8) | this.dmaAddress[0]);
          } else {
            this.ppu.OAM[this.dmaAddress[0]] = this.dmaData[0];
            this.dmaAddress[0]++;
            // If this wraps around, we know that 256 bytes have been written, so end the DMA transfer, and proceed as normal
            if (this.dmaAddress[0] === 0) {
              this.dmaDummy = true;
              this.dmaTransfer = false;
            }
          }
        }
      } else {
        cpu.clock();
      }
    }

    // The PPU is capable of emitting an interrupt to indicate the vertical blanking period has been entered. If it has, the irq is sent to the CPU.
    if (this.ppu.nmi) {
      this.ppu.nmi = false;
      cpu.nmi();
    }

    this.systemClockCounter[0]++;
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range. Every 2 kilobyte is mirrored.
   */
  cpuRead(address) {
    const read = this.cartridge.cpuReadCart(address);
    if (read) {
      return read.data;
    } else if (address >= 0x0000 && address <= 0x1FFF) {
      return this.cpuRAM[address & 0x07FF];                // System RAM Address Range, mirrored every 2048
    } else if (address >= 0x2000 && address <= 0x3FFF) {
      return this.ppu.readByCPU(address & 0x0007);          // PPU Address range, mirrored every 8
    } else if (address >= 0x4016 && address <= 0x4017) {
      const data = (this.controllerState[address & 0x0001] & 0x80) > 0 ? 1 : 0;
      this.controllerState[address & 0x0001] <<= 1;      // Read out the MSB of the controller status word
      return data;
    }
  }

  /**
   *  The RAM is addressed within an 8-kilobyte range even though there are only 2 kilobytes available. Every 2 kilobyte
   *  is mirrored.
   */
  cpuWrite(address, data) {
    if (this.cartridge.cpuWriteCart(address, data)) {

    } else if (address >= 0x0000 && address <= 0x1FFF) {
      this.cpuRAM[address & 0x07FF] = data;         // Using bitwise AND to mask the bottom 11 bits is the same as addr % 2048.
    } else if (address >= 0x2000 && address <= 0x3FFF) {   // PPU Address range. The PPU only has 8 primary registers and these are repeated throughout this range.
      this.ppu.writeByCPU(address & 0x0007, data);    // bitwise AND operation to mask the bottom 3 bits, which is the equivalent of addr % 8.
    } else if (address === 0x4014) {
      this.dmaPage[0] = data;
      this.dmaAddress[0] = 0x00;
      this.dmaTransfer = true;
    } else if (address >= 0x4016 && address <= 0x4017) {
      this.controllerState[address & 0x0001] = this.controllers[address & 0x0001];
    }
  }
}

/**
 * Picture Processing Unit - generates a composite video signal with 240 lines of pixels to a screen.
 * The CPU talks to the PPU via 8 (actually 9) registers using addresses 0x2000 - 0x2007 (although they are
 * mirrored over a larger address range).
 *
 * 0x2000 CTRL    responsible for configuring the PPU to render in different ways
 * 0x2001 MASK    decides whether background or sprites are being drawn, and what's happening at the edges of the screen
 * 0x2002 STATUS  tells when it is safe to render

 * 0x2005 SCROLL  through this register we can represent game worlds far larger than we can see on the screen
 * 0x2006 ADDRESS allows the CPU to directly read and write to the PPU's memory
 * 0x2007 DATA    allows the CPU to directly read and write to the PPU's memory
 */
class PPU {
  palettes = new MemoryArea();      // contains the colors
  nameTable1 = new MemoryArea(1024);   // describes the layout of the background
  nameTable2 = new MemoryArea(1024);   // describes the layout of the background
  patternTable1 = new MemoryArea(4096);
  patternTable2 = new MemoryArea(4096);

  addressOAM = new Uint8Array(1);    // Some ports may access the OAM directly on this address
  OAM = new Uint8Array(0x100);     // contains approximately 64 sprites (256 bytes), where each sprite's information occupies 4 bytes
  secondaryOAM = new Uint8Array(0x20);   // Stores information about up to 8 sprites
  spriteCount = 0;    // How many sprites we find from the OAM that are going to be rendered on the next scanline, fill secondaryOAM with those

  // Sprite Zero Collision Flags
  spriteZeroHitPossible = false;
  spriteZeroBeingRendered = false;

  loopyVRAM = new LoopyRegister();      // Active "pointer" address into nametable to extract background tile info
  loopyTRAM = new LoopyRegister();      // Temporary store of information to be "transferred" into "pointer" at various times
  fineX;

  statusRegister = new StatusRegister();
  maskRegister = new MaskRegister();
  controlRegister = new ControlRegister();

  oddFrame = false;
  scanlineTrigger = false;
  nmi = false;
  scanline = 0;     // Represent which row of the screen, a scanline is 1 pixel high
  cycle = 0;        // Represent current column of the screen
  frameComplete = false;
  addressLatch = 0x00;      // This is used to govern writing to the low byte or high byte
  dataBuffer;   // When we read data from the PPU it is delayed by 1 cycle so we need to buffer that byte

  palScreen = [
    [101,101,101], [0,45,105], [19,31,127], [60,19,124], [96,11,98], [115,10,55], [113,15,7], [90,26,0], [52,40,0], [11,52,0],
    [0,60,0], [0,61,16], [0,56,64], [0,0,0], [0,0,0], [0,0,0], [174,174,174], [15,99,179], [64,81,208], [120,65,204], [167,54,169],
    [192,52,112], [189,60,48], [159,74,0], [109,92,0], [54,109,0], [7,119,4], [0,121,61], [0,114,125], [0,0,0], [0,0,0], [0,0,0],
    [254,254,255], [93,179,255], [143,161,255], [200,144,255], [247,133,250], [255,131,192], [255,139,127], [239,154,73],
    [189,172,44], [133,188,47], [85,199,83], [60,201,140], [62,194,205], [78,78,78], [0,0,0], [0,0,0], [254,254,255], [188,223,255],
    [209,216,255], [232,209,255], [251,205,253], [255,204,229], [255,207,202], [248,213,180], [228,220,168], [204,227,169],
    [185,232,184], [174,232,208], [175,229,234], [182,182,182], [0,0,0], [0,0,0]
  ];

  // Background rendering
  bgNextTileID = new Uint8Array(1);
  bgNextTileAttribute = new Uint8Array(1);
  bgNextTileLSB = new Uint8Array(1);
  bgNextTileMSB = new Uint8Array(1);
  bgShifterPatternLow = new Uint16Array(1);
  bgShifterPatternHigh = new Uint16Array(1);
  bgShifterAttributeLow = new Uint16Array(1);
  bgShifterAttributeHigh = new Uint16Array(1);

  spriteShifterPatternLow = new Uint8Array(8);      // Low-bit plane of the sprite
  spriteShifterPatternHigh = new Uint8Array(8);      // High-bit plane of the sprite

  cartridge;
  ctx;
  imageData = [];         // Contains the pixel information that is rendered each frame

  setContext(context) {
    this.ctx = context;
  }

  /**
   * Renders the current frame on the canvas. The offset corresponds to the pixels' location (X, Y) on the screen.
   * The offset is used to transfer the pixels' RGBA (color) values into the Canvas image data.
   * Lastly, the imageData array is cleared in order to make room for the pixels to be rendered during the next frame.
   */
  drawImageData() {
    const imageData = this.ctx.getImageData(0, 0, 256, 240);
    for (let x = 0; x < 256; x++) {
      for (let y = 0; y < 240; y++) {
        let offset = (y * 256 + x) * 4;
        imageData.data[offset] = this.imageData[offset];
        imageData.data[offset + 1] = this.imageData[offset + 1];
        imageData.data[offset + 2] = this.imageData[offset + 2];
        imageData.data[offset + 3] = this.imageData[offset + 3];
      }
    }
    this.ctx.putImageData(imageData, 0, 0);
    this.imageData = [];
  }

  /**
   * Stores a pixel in an array for later rendering. The offset corresponds to the pixels' location (X, Y) on the screen
   * and its color (RGBA) is stored in the 4 bytes from the offset, where A = 255;
   */
  storePixel(x, y, palette) {
    let offset = (y * 256 + x) * 4;
    this.imageData[offset] = palette[0];
    this.imageData[offset + 1] = palette[1];
    this.imageData[offset + 2] = palette[2];
    this.imageData[offset + 3] = 255;
  }

  connectCartridge(cartridge) {
    this.cartridge = cartridge;
  }

  /**
   *  Reverses the bits of an 8-bit value.
   */
  reverseBits(value) {
    value = (value & 0xF0) >> 4 | (value & 0x0F) << 4;
    value = (value & 0xCC) >> 2 | (value & 0x33) << 2;
    value = (value & 0xAA) >> 1 | (value & 0x55) << 1;

    return value;
  }

  /**
   * To facilitate scrolling the NES stores two Nametables that lies next to each other. As the viewable area of the screen scrolls across
   * it crosses this boundary and we render from two different nametables simultaneously. The CPU is tasked with updating the invisible
   * parts of the nametable with the bits of level that are going to be seen next. When the viewable window scrolls past the end of
   * the second nametable, it is wrapped back around into the first one, and this allows you to have a continuous scrolling motion
   * in two directions.
   */
  incrementScrollX() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      if (this.loopyVRAM.getCoarseX() === 31) {
        this.loopyVRAM.setCoarseX(0);
        this.loopyVRAM.setNameTableX(this.loopyVRAM.getNameTableX() > 0 ? 0 : 1);     // Flip a bit
      } else {
        this.loopyVRAM.setCoarseX(this.loopyVRAM.getCoarseX() + 1);
      }
    }
  }

  incrementScrollY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      if (this.loopyVRAM.getFineY() < 7) {
        this.loopyVRAM.setFineY(this.loopyVRAM.getFineY() + 1);
      } else {
        this.loopyVRAM.setFineY(0);
        if (this.loopyVRAM.getCoarseY() === 29) {
          this.loopyVRAM.setCoarseY(0);
          this.loopyVRAM.setNameTableY(this.loopyVRAM.getNameTableY() > 0 ? 0 : 1);   // Flip a bit
        } else if (this.loopyVRAM.getCoarseY() === 31) {
          this.loopyVRAM.setCoarseY(0);
        } else {
          this.loopyVRAM.setCoarseY(this.loopyVRAM.getCoarseY() + 1);
        }
      }
    }
  }

  transferAddressX() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.loopyVRAM.setNameTableX(this.loopyTRAM.getNameTableX());
      this.loopyVRAM.setCoarseX(this.loopyTRAM.getCoarseX());
    }
  }

  transferAddressY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.loopyVRAM.setFineY(this.loopyTRAM.getFineY());
      this.loopyVRAM.setNameTableY(this.loopyTRAM.getNameTableY());
      this.loopyVRAM.setCoarseY(this.loopyTRAM.getCoarseY());
    }
  }

  /**
   * 8 pixels in scanline
   */
  loadBackgroundShifters() {
    this.bgShifterPatternLow[0] = (this.bgShifterPatternLow[0] & 0xFF00) | this.bgNextTileLSB[0];
    this.bgShifterPatternHigh[0] = (this.bgShifterPatternHigh[0] & 0xFF00) | this.bgNextTileMSB[0];

    this.bgShifterAttributeLow[0] = (this.bgShifterAttributeLow[0] & 0xFF00) | ((this.bgNextTileAttribute[0] & 0b01) > 0 ? 0xFF : 0x00);
    this.bgShifterAttributeHigh[0] = (this.bgShifterAttributeHigh[0] & 0xFF00) | ((this.bgNextTileAttribute[0] & 0b10) > 0 ? 0xFF : 0x00);
  }

  /**
   * Shifting background tile pattern row and palette attributes by 1
   */
  updateShifters() {
    if (this.maskRegister.getRenderBackground()) {
      this.bgShifterPatternLow[0] <<= 1;
      this.bgShifterPatternHigh[0] <<= 1;

      this.bgShifterAttributeLow[0] <<= 1;
      this.bgShifterAttributeHigh[0] <<= 1;
    }

    if (this.maskRegister.getRenderSprites() && this.cycle >= 1 && this.cycle < 258) {
      for (let i = 0, j = 0; i < this.spriteCount; i++, j += 4) {
        if (this.secondaryOAM[j + 3] > 0) {     // OAE X
          this.secondaryOAM[j + 3]--;
        } else {
          this.spriteShifterPatternLow[i] <<= 1;
          this.spriteShifterPatternHigh[i] <<= 1;
        }
      }
    }
  }

  /**
   * PPU is actively drawing screen state during scanlines  0 - 240.
   * During scanlines 241 - 262, the CPU is updating the state of PPU for the next frame.
   *
   * scanlines represent the horizontal rows across the screen. The NES is 256 pixels across this line, and 240 pixels down.
   * However, the scanline can exceed this dimension. One cycle is one pixel across the scanline (crudly). Since the scanline goes
   * beyond the edge of the screen so does the cycle count. There are 341 cycles per scanline (an approximation). Scanlines
   * continue under the bottom of the screen. Thus there are 261 scanlines. This period of unseen scanlines is called
   * Vertical Blanking Period. Once the vertical bland period has
   * started, the CPU can change the nature of the PPU. It is during this period
   * that the CPU is setting up the PPU for the next frame. In this emulator we use a -1 scanline as a starting point after
   * the last scanline in the period is finished.
   * It is important that the CPU finishes what it is doing while the screen is being rendered, otherwise we will get lag.
   * The vertical_blank bit in the STATUS word tells us if we are in screen space (0) or vertical bland period (1).
   * The CPU might have to wait an entire frame before the screen is updated.
   */
  clock() {
    if (this.scanline >= -1 && this.scanline < 240) {

      /*
              ************************
              | Background Rendering |
              ************************
       */

      // We leave the vertical blank period when we are at the top left of the screen, which is when scanline is -1 and cycle = 1
      if (this.scanline === -1 && this.cycle === 1) {
        this.statusRegister.setVerticalBlank(0);        // Effectively start of new frame, so clear vertical blank flag
        this.statusRegister.setSpriteOverflow(0);
        this.statusRegister.setSpriteZeroHit(0);
        // Clear Shifters
        for (let i = 0; i < 8; i++) {
          this.spriteShifterPatternHigh[i] = 0;
          this.spriteShifterPatternLow[i] = 0;
        }
      }

      if (this.scanline === 0 && this.cycle === 0 && this.oddFrame && (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites())) {
        this.cycle = 1;     // "Odd Frame" cycle skip
      }

      if ((this.cycle >= 2 && this.cycle < 258) || (this.cycle >= 321 && this.cycle < 338)) {
        this.updateShifters();

        switch ((this.cycle - 1) % 8) {    // These cycles are for pre-loading the PPU with the information it needs to render the next 8 pixels
          case 0:
            this.loadBackgroundShifters();          // Load the current background tile pattern and attributes into the "shifter"
            this.bgNextTileID[0] = this.ppuRead(0x2000 | (this.loopyVRAM.getRegister() & 0x0FFF));
            break;
          case 2:
            this.bgNextTileAttribute[0] = this.ppuRead(0x23C0 | (this.loopyVRAM.getNameTableY() << 11)
              | (this.loopyVRAM.getNameTableX() << 10)
              | ((this.loopyVRAM.getCoarseY() >> 2) << 3)
              | (this.loopyVRAM.getCoarseX() >> 2));
            if (this.loopyVRAM.getCoarseY() & 0x02) {
              this.bgNextTileAttribute[0] >>= 4;
            }
            if (this.loopyVRAM.getCoarseX() & 0x02) {
              this.bgNextTileAttribute[0] >>= 2;
            }
            this.bgNextTileAttribute[0] &= 0x03;
            break;
          case 4:
            this.bgNextTileLSB[0] = this.ppuRead((this.controlRegister.getPatternBackground() << 12)
              + (this.bgNextTileID[0] << 4)
              + this.loopyVRAM.getFineY());
            break;
          case 6:
            this.bgNextTileMSB[0] = this.ppuRead((this.controlRegister.getPatternBackground() << 12)
              + (this.bgNextTileID[0] << 4)
              + this.loopyVRAM.getFineY() + 8);
            break;
          case 7:
            this.incrementScrollX();
            break;
        }
      }

      if (this.cycle === 256) {   // End of a visible scanline, increment downwards
        this.incrementScrollY();
      }

      if (this.cycle === 257) {   //  Reset the X position
        this.loadBackgroundShifters();
        this.transferAddressX();
      }

      if (this.cycle === 338 || this.cycle === 340) {
        this.bgNextTileID[0] = this.ppuRead(0x2000 | (this.loopyVRAM.getRegister() & 0x0FFF));
      }

      if (this.scanline === -1 && this.cycle >= 280 && this.cycle < 305) {    // End of vertical blank period so reset the Y address ready for rendering
        this.transferAddressY();
      }

      /*
            ************************
            | Foreground Rendering |
            ************************
     */
      if (this.cycle === 257 && this.scanline >= 0) {
        this.secondaryOAM.fill(0xFF);
        this.spriteCount = 0;

        // Secondly, clear out any residual information in sprite pattern shifters
        for (let i = 0; i < 8; i++) {
          this.spriteShifterPatternLow[i] = 0;
          this.spriteShifterPatternHigh[i] = 0;
        }
        this.spriteZeroHitPossible = false;

        let OAMEntry = 0;
        while (OAMEntry < 256 && this.spriteCount < 9) {
          let diff = new Int16Array(1);
          diff[0] = this.scanline - this.OAM[OAMEntry];
          if (diff[0] >= 0 && diff[0] < (this.controlRegister.getSpriteSize() ? 16 : 8) && this.spriteCount < 8) {
            if (this.spriteCount < 8) {
              if (OAMEntry === 0) {     // Is this sprite sprite zero?
                this.spriteZeroHitPossible = true;
              }
              this.secondaryOAM[this.spriteCount * 4] = this.OAM[OAMEntry];           // Copy OAE Y
              this.secondaryOAM[this.spriteCount * 4 + 1] = this.OAM[OAMEntry + 1];   // Copy OAE Tile ID
              this.secondaryOAM[this.spriteCount * 4 + 2] = this.OAM[OAMEntry + 2];   // Copy OAE Attributes
              this.secondaryOAM[this.spriteCount * 4 + 3] = this.OAM[OAMEntry + 3];   // Copy OAE X
            }
            this.spriteCount++;
          }
          OAMEntry += 4;
        } // End of sprite evaluation for next scanline

        if (this.spriteCount >= 8) {
          this.statusRegister.setSpriteOverflow(1);
        } else {
          this.statusRegister.setSpriteOverflow(0);
        }
      }

      if (this.cycle === 340) {   // The end of the scanline, Prepare the sprite shifters with the 8 or less selected sprites.
        for (let i = 0, j = 0; i < this.spriteCount; i++, j += 4) {
          const spritePatternBitsLow = new Uint8Array(1);
          const spritePatternBitsHigh = new Uint8Array(1);
          const spritePatternAddressLow = new Uint16Array(1);
          const spritePatternAddressHigh = new Uint16Array(1);
          if (!this.controlRegister.getSpriteSize()) {
            // 8x8 Sprite Mode - The control register determines the pattern table
            if (!(this.secondaryOAM[j + 2] & 0x80)) {   // OAE attributes
              // Sprite is NOT flipped vertically, i.e. normal
              spritePatternAddressLow[0] = (this.controlRegister.getPatternSprite() << 12)  // Which Pattern Table? 0KB or 4KB offset
                | (this.secondaryOAM[j + 1] << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                | (this.scanline - this.secondaryOAM[j]); // Which Row in cell? (0->7)    (OAE X)
            } else {
              // Sprite is flipped vertically, i.e. upside down
              spritePatternAddressLow[0] = (this.controlRegister.getPatternSprite() << 12)  // Which Pattern Table? 0KB or 4KB offset
                | (this.secondaryOAM[j + 1] << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                | (7 - (this.scanline - this.secondaryOAM[j])); // Which Row in cell? (7->0)
            }
          } else {
            // 8x16 Sprite Mode - The sprite attribute determines the pattern table
            if (!(this.secondaryOAM[j + 2] & 0x80)) {       // OAE attributes
              // Sprite is NOT flipped vertically, i.e. normal
              if ((this.scanline - this.secondaryOAM[j]) < 8) {    // OAE Y
                // Reading Top half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)  // Which Pattern Table? 0KB or 4KB offset
                  | ((this.secondaryOAM[j + 1] & 0xFE) << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | ((this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              } else {
                // Reading Bottom Half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)  // Which Pattern Table? 0KB or 4KB offset
                  | (((this.secondaryOAM[j + 1] & 0xFE) + 1) << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | ((this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              }
            } else {
              // Sprite is flipped vertically, i.e. upside down
              if ((this.scanline - this.secondaryOAM[j]) < 8) {
                // Reading Top half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)    // Which Pattern Table? 0KB or 4KB offset
                  | (((this.secondaryOAM[j + 1] & 0xFE) + 1) << 4)    // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | (7 - (this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              } else {
                // Reading Bottom Half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)    // Which Pattern Table? 0KB or 4KB offset
                  | ((this.secondaryOAM[j + 1] & 0xFE) << 4)    // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | (7 - (this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              }
            }
          }

          // High bit plane equivalent is always offset by 8 bytes from lo bit plane
          spritePatternAddressHigh[0] = spritePatternAddressLow[0] + 8;

          // Now we have the address of the sprite patterns, we can read them
          spritePatternBitsLow[0] = this.ppuRead(spritePatternAddressLow[0]);
          spritePatternBitsHigh[0] = this.ppuRead(spritePatternAddressHigh[0]);

          // If the sprite is flipped horizontally, we need to flip the pattern bytes.
          if (this.secondaryOAM[j + 2] & 0x40) {
            // Flip Patterns Horizontally
            spritePatternBitsHigh[0] = this.reverseBits(spritePatternBitsHigh[0]);
            spritePatternBitsLow[0] = this.reverseBits(spritePatternBitsLow[0]);
          }

          // Load the pattern into sprite shift registers ready for rendering on the next scanline
          this.spriteShifterPatternLow[i] = spritePatternBitsLow[0];
          this.spriteShifterPatternHigh[i] = spritePatternBitsHigh[0];
        }
      }
    }

    if (this.scanline === 240) {

    }

    if (this.scanline >= 241 && this.scanline < 261) {
      if (this.scanline === 241 && this.cycle === 1) {
        this.statusRegister.setVerticalBlank(1);
        if (this.controlRegister.getEnableNMI()) {
          this.nmi = true;                                // The PPU must inform the CPU about the nmi(), and this can be done in the bus
        }
      }
    }

    // Background =============================================================
    let bgPixel = 0x00;                                     // The 2-bit pixel to be rendered
    let bgPalette = 0x00;                                   // The 3-bit index of the palette the pixel indexes
    if (this.maskRegister.getRenderBackground()) {
      if (this.maskRegister.getRenderBackgroundLeft() || (this.cycle >= 9)) {
        const bitMux = new Uint16Array(1);
        bitMux[0] = 0x8000 >> this.fineX;
        const pixelPlane0 = (this.bgShifterPatternLow[0] & bitMux[0]) > 0 ? 1 : 0;
        const pixelPlane1 = (this.bgShifterPatternHigh[0] & bitMux[0]) > 0 ? 1 : 0;
        bgPixel = (pixelPlane1 << 1) | pixelPlane0;         // Combine to form pixel index

        const pal0 = (this.bgShifterAttributeLow[0] & bitMux[0]) > 0 ? 1 : 0;
        const pal1 = (this.bgShifterAttributeHigh[0] & bitMux[0]) > 0 ? 1 : 0;
        bgPalette = (pal1 << 1) | pal0;
      }
    }

    // Foreground =============================================================
    let fgPixel = 0x00;     // The 2-bit pixel to be rendered
    let fgPalette = 0x00;   // The 3-bit index of the palette the pixel indexes
    let fgPriority = 0x00;  // A bit of the sprite attribute indicates if its

    if (this.maskRegister.getRenderSprites()) {
      if (this.maskRegister.getRenderSpritesLeft() || (this.cycle >= 9)) {
        this.spriteZeroBeingRendered = false;
        for (let i = 0, j = 0; i < this.spriteCount; i++, j += 4) {
          // Scanline cycle has "collided" with sprite, shifters taking over
          if (this.secondaryOAM[j + 3] === 0) {   // OAE X, If X coordinate = 0, start to draw sprites
            let fg_pixel_lo = (this.spriteShifterPatternLow[i] & 0x80) > 0 ? 1 : 0;
            let fg_pixel_hi = (this.spriteShifterPatternHigh[i] & 0x80) > 0 ? 1 : 0;
            fgPixel = (fg_pixel_hi << 1) | fg_pixel_lo;

            fgPalette = (this.secondaryOAM[j + 2] & 0x03) + 0x04;     // OAE attributes
            fgPriority = (this.secondaryOAM[j + 2] & 0x20) === 0 ? 1 : 0;    // OAE attributes

            if (fgPixel !== 0) {
              if (i === 0) {
                this.spriteZeroBeingRendered = true;
              }
              break;
            }
          }
        }
      }
    }

    // Decide if the background pixel or the sprite pixel has priority. It is possible for sprites
    // to go behind background tiles that are not "transparent" (value 0).
    let pixel = 0x00;
    let palette = 0x00;
    if (bgPixel === 0 && fgPixel > 0) {
      pixel = fgPixel;
      palette = fgPalette;
    } else if (bgPixel > 0 && fgPixel === 0) {
      pixel = bgPixel;
      palette = bgPalette;
    } else if (bgPixel > 0 && fgPixel > 0) {
      if (fgPriority) {
        pixel = fgPixel;
        palette = fgPalette;
      } else {
        pixel = bgPixel;
        palette = bgPalette;
      }

      if (this.spriteZeroHitPossible && this.spriteZeroBeingRendered) {   // Sprite Zero Hit detection
        // Sprite zero is a collision between foreground and background
        // so they must both be enabled
        if (this.maskRegister.getRenderBackground() & this.maskRegister.getRenderSprites()) {
          // The left edge of the screen has specific switches to control its appearance.
          // This is used to smooth inconsistencies when scrolling (since sprites X coordinate must be >= 0)
          if (!(this.maskRegister.getRenderBackgroundLeft() | this.maskRegister.getRenderSpritesLeft())) {
            if (this.cycle >= 9 && this.cycle < 258) {
              this.statusRegister.setSpriteZeroHit(1);
            }
          } else {
            if (this.cycle >= 1 && this.cycle < 258) {
              this.statusRegister.setSpriteZeroHit(1);
            }
          }
        }
      }
    }

    // At each location on the screen we want to store a pixel's X and Y coordinate along with the pixel's color
    this.storePixel(this.cycle - 1, this.scanline, this.getColorFromPalScreen(palette, pixel));

    this.cycle++;

    if (this.cycle >= 341) {
      this.cycle = 0;
      this.scanline++;
      if (this.scanline >= 261) {
        this.drawImageData();
        this.scanline = -1;
        this.frameComplete = true;
        this.oddFrame = !this.oddFrame;
      }
    }
  }

  isFrameCompleted() {
    return this.frameComplete;
  }

  readByCPU(address) {
    switch (address) {
      case 0x0000: // Control
        break;
      case 0x0001: // Mask
        break;
      case 0x0002: // Status
        // The act of reading is changing the state of the device
        const result = (this.statusRegister.getRegister() & 0xE0) | (this.dataBuffer & 0x1F);
        this.statusRegister.setVerticalBlank(0);
        this.addressLatch = 0;
        return result;
      case 0x0003: // OAM Address
        break;
      case 0x0004: // OAM Data
        return this.OAM[this.addressOAM[0]];
      case 0x0005: // Scroll
        break;
      case 0x0006: // PPU Address
        break;
      case 0x0007: // PPU Data
        let data  = this.dataBuffer;
        this.dataBuffer = this.ppuRead(this.loopyVRAM.getRegister());
        if (this.loopyVRAM.getRegister() >= 0x3F00) {   // Handle palette addresses
          data = this.dataBuffer;
        }
        this.loopyVRAM.setRegister(this.loopyVRAM.getRegister() + (this.controlRegister.getIncrementMode() ? 32 : 1));
        return data;
    }

    return 0x00;
  }

  writeByCPU(address, data) {
    switch (address) {
      case 0x0000: // Control
        this.controlRegister.setRegister(data);
        this.loopyTRAM.setNameTableX(this.controlRegister.getNameTableX());
        this.loopyTRAM.setNameTableY(this.controlRegister.getNameTableY());
        break;
      case 0x0001: // Mask
        this.maskRegister.setRegister(data);
        break;
      case 0x0002: // Status
        break;
      case 0x0003: // OAM Address
        this.addressOAM[0] = data;
        break;
      case 0x0004: // OAM Data
        this.OAM[this.addressOAM[0]] = data;
        break;
      case 0x0005: // Scroll
        if (this.addressLatch === 0) {      // Address latch is used to indicate if I am writing to the low byte or the high byte
          this.fineX = data & 0x07;     // offset (0 - 7) into a single cell
          this.loopyTRAM.setCoarseX(data >> 3);
          this.addressLatch = 1;
        } else {
          this.loopyTRAM.setFineY(data & 0x07);
          this.loopyTRAM.setCoarseY(data >> 3);
          this.addressLatch = 0;
        }
        break;
      case 0x0006: // PPU Address
        if (this.addressLatch === 0) {
          this.loopyTRAM.setRegister(((data & 0x3F) << 8) | (this.loopyTRAM.getRegister() & 0x00FF));   // Store the lower 8 bits of the PPU address
          this.addressLatch = 1;
        } else {
          this.loopyTRAM.setRegister((this.loopyTRAM.getRegister() & 0xFF00) | data);     // LoopyTram holds the desired scroll address which the PPU uses to refresh loopyV
          this.loopyVRAM.setRegister(this.loopyTRAM.getRegister());
          this.addressLatch = 0;
        }
        break;
      case 0x0007: // PPU Data
        this.ppuWrite(this.loopyVRAM.getRegister(), data);
        // Skip 32 tiles at a time along the X-axis (which is the same as going down 1 row in the Y-axis), or increment 1 along the X-axis
        this.loopyVRAM.setRegister(this.loopyVRAM.getRegister() + (this.controlRegister.getIncrementMode() ? 32 : 1));
        break;
    }
  }

  ppuRead(address) {
    address &= 0x3FFF;
    const read = this.cartridge.ppuReadCart(address);
    if (read) {
      return read.data;
    } else if (address >= 0x0000 && address <= 0x1FFF) {
      // If the cartridge cant map the address, have a physical location ready here
      if ((address & 0x1000) >> 12) {
        return this.patternTable2.read(address & 0x0FFF);
      } else {
        return this.patternTable1.read(address & 0x0FFF);
      }
    } else if (address >= 0x2000 && address <= 0x3EFF) {
      address &= 0x0FFF;
      if (Object.is(Mirror.VERTICAL, this.cartridge.getMirror())) {
        if (address >= 0x0000 && address <= 0x03FF) {
          return this.nameTable1.read(address & 0x03FF);
        } else if (address >= 0x0400 && address <= 0x07FF) {
          return this.nameTable2.read(address & 0x03FF);
        } else if (address >= 0x0800 && address <= 0x0BFF) {
          return this.nameTable1.read(address & 0x03FF);
        } else if (address >= 0x0C00 && address <= 0x0FFF) {
          return this.nameTable2.read(address & 0x03FF);
        }
      } else if (Object.is(Mirror.HORIZONTAL, this.cartridge.getMirror())) {
        if (address >= 0x0000 && address <= 0x03FF) {
          return this.nameTable1.read(address & 0x03FF);
        } else if (address >= 0x0400 && address <= 0x07FF) {
          return this.nameTable1.read(address & 0x03FF);
        } else if (address >= 0x0800 && address <= 0x0BFF) {
          return this.nameTable2.read(address & 0x03FF);
        } else if (address >= 0x0C00 && address <= 0x0FFF) {
          return this.nameTable2.read(address & 0x03FF);
        }
      }
    } else if (address >= 0x3F00 && address <= 0x3FFF) {
      address &= 0x001F;
      if (address === 0x0010) {
        address = 0x0000;
      } else if (address === 0x0014) {
        address = 0x0004;
      } else if (address === 0x0018) {
        address = 0x0008;
      } else if (address === 0x001C) {
        address = 0x000C;
      }
      return this.palettes.read(address) & ((this.maskRegister.getGrayScale() > 0) ? 0x30 : 0x3F);
    }
    return 0x00;
  }

  ppuWrite(address, data) {
    address &= 0x3FFF;

    if (this.cartridge.ppuWriteCart(address, data)) {

    } else if (address >= 0x0000 && address <= 0x1FFF) {
      if ((address & 0x1000) >> 12) {
        this.patternTable2.write(address & 0x0FFF, data);
      } else {
        this.patternTable1.write(address & 0x0FFF, data);
      }
    } else if (address >= 0x2000 && address <= 0x3EFF) {
      address &= 0x0FFF;
      if (Object.is(Mirror.VERTICAL, this.cartridge.getMirror())) {
        if (address >= 0x0000 && address <= 0x03FF) {
          this.nameTable1.write(address & 0x03FF, data);
        } else if (address >= 0x0400 && address <= 0x07FF) {
          this.nameTable2.write(address & 0x03FF, data);
        } else if (address >= 0x0800 && address <= 0x0BFF) {
          this.nameTable1.write(address & 0x03FF, data);
        } else if (address >= 0x0C00 && address <= 0x0FFF) {
          this.nameTable2.write(address & 0x03FF, data);
        }
      } else if (Object.is(Mirror.HORIZONTAL, this.cartridge.getMirror())) {
        if (address >= 0x0000 && address <= 0x03FF) {
          this.nameTable1.write(address & 0x03FF, data);
        } else if (address >= 0x0400 && address <= 0x07FF) {
          this.nameTable1.write(address & 0x03FF, data);
        } else if (address >= 0x0800 && address <= 0x0BFF) {
          this.nameTable2.write(address & 0x03FF, data);
        } else if (address >= 0x0C00 && address <= 0x0FFF) {
          this.nameTable2.write(address & 0x03FF, data);
        }
      }
    } else if (address >= 0x3F00 && address <= 0x3FFF) {
      address &= 0x001F;
      if (address === 0x0010) {
        address = 0x0000;
      } else if (address === 0x0014) {
        address = 0x0004;
      } else if (address === 0x0018) {
        address = 0x0008;
      } else if (address === 0x001C) {
        address = 0x000C;
      }
      this.palettes.write(address, data);
    }
  }

  /**
   *  Returns a screen color corresponding to the given palette and pixel index.
   * "0x3F00"       - Offset into PPU addressable range where palettes are stored
   * "palette << 2" - Each palette is 4 bytes in size
   * "pixel"        - Each pixel index is either 0, 1, 2 or 3
   * "& 0x3F"       - Prevents reading beyond the bounds of the palScreen array
   */
  getColorFromPalScreen(palette, pixel) {
    return this.palScreen[this.ppuRead(0x3F00 + (palette << 2) + pixel) & 0x3F];
  }

  reset() {
    this.fineX = 0x00;
    this.addressLatch = 0x00;
    this.dataBuffer = 0x00;
    this.scanline = 0;
    this.cycle = 0;
    this.bgShifterAttributeHigh[0] = 0x0000;
    this.bgShifterAttributeLow[0] = 0x0000;
    this.bgShifterPatternLow[0] = 0x0000;
    this.bgShifterPatternHigh[0] = 0x0000;
    this.bgNextTileID[0] = 0x00;
    this.bgNextTileAttribute[0] = 0x00;
    this.bgNextTileLSB[0] = 0x00;
    this.bgNextTileMSB[0] = 0x00;
    this.statusRegister.setRegister(0x00);
    this.maskRegister.setRegister(0x00);
    this.controlRegister.setRegister(0x00);
    this.loopyVRAM.setRegister(0x0000);
    this.loopyTRAM.setRegister(0x0000);
    this.scanlineTrigger = false;
    this.oddFrame = false;
    this.palettes = new MemoryArea();
    this.nameTable1 = new MemoryArea(1024);
    this.nameTable2 = new MemoryArea(1024);
    this.patternTable1 = new MemoryArea(4096);
    this.patternTable2 = new MemoryArea(4096);
  }
}

/**
 * A Mapper takes the incoming addresses from both buses and transform them to the correct memory location on
 * the Cartridge. Thus, the CPU is oblivious to the data it is reading and writing. The same goes for the PPU.
 * There are many different variants of Mappers. Note that the purpose of a Mapper is not to provide any data,
 * it only translates addresses.
 */
class Mapper {
  programBanks;
  characterBanks;

  constructor(programBanks, characterBanks) {
    this.programBanks = programBanks;
    this.characterBanks = characterBanks;
  }

  mapReadCPU(address) {
    return false;
  }

  mapWriteCPU(address) {
    return false;
  }

  mapReadPPU(address) {
    return false;
  }

  mapWritePPU(address) {
    return false;
  }

  reset() {

  }

  mirror() {
    return Mirror.HARDWARE;
  }
}

/**
 * Mapper 000
 */
class MapperZero extends Mapper {
  id = 0;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      const mappedAddress = address & (this.programBanks > 1 ? 0x7FFF : 0x3FFF);
      return { "address": mappedAddress };
    }
    return false;
  }

  mapWriteCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      const mappedAddress = address & (this.programBanks > 1 ? 0x7FFF : 0x3FFF);
      return { "address": mappedAddress };
    }
    return false;
  }

  mapReadPPU(address) {
    if (address >= 0x0000 && address <= 0x1FFF) {
      return { "address": address };
    }
    return false;
  }

  mapWritePPU(address) {
    if (address >= 0x0000 && address <= 0x1FFF) {
      if (this.programBanks === 0) {
        return { "address": address };
      }
    }
    return false;
  }
}

/**
 * A Cartridge contains game code and data, i.e., Program Rom, Mapper and an 8-kilobyte Pattern table.
 * Pattern memory is also known as Character memory. A Cartridge is connected to both buses.
 */
class Cartridge {
  header;
  imageValid = false;

  programMemory = [];
  characterMemory = [];
  mapper;

  mapperID = 0;
  programBanks = 0;                   // Single bank of program memory is 16 kB
  characterBanks = 0;                 // Single bank of character memory is 8 kB
  mirror = Mirror.HORIZONTAL;

  constructor(cartridge) {
    this.header = new FormatHeader(cartridge.subarray(0, 16));
    let index = 16;

    if (this.header.getMapper1() & 0x04) {
      index += 512;   // If a "trainer" exists we read past it
    }

    this.mapperID = ((this.header.getMapper2() >> 4) << 4) | (this.header.getMapper1() >> 4);
    this.mirror = (this.header.getMapper1() & 0x01) ? Mirror.VERTICAL : Mirror.HORIZONTAL;

    const fileType = 1;       // 3 types of iNES file     (0, 1, and 2)

    if (fileType === 0) {

    }

    if (fileType === 1) {
      this.programBanks = this.header.getProgramChunks();
      const programMemoryLength = this.header.getProgramChunks() * 16384;
      this.programMemory = cartridge.subarray(index, index + programMemoryLength);
      index += programMemoryLength;

      this.characterBanks = this.header.getCharacterChunks();

      let characterMemoryLength = 8192;
      if (this.characterBanks > 1) {
        characterMemoryLength = this.characterBanks * 8192;
      }
      this.characterMemory = cartridge.subarray(index, index + characterMemoryLength);
    }

    if (fileType === 2) {

    }

    switch (this.mapperID) {
      case 0:
        this.mapper = new MapperZero(this.programBanks, this.characterBanks);
        break;
      case 2:
        break;
      case 3:
        break;
      case 66:
        break;
    }

    this.imageValid = true;
  }

  cpuReadCart(address) {
    const mapped = this.mapper.mapReadCPU(address);
    if (mapped) {
      if (mapped.address === 0xFFFFFFFF) {
        return true;
      }
      return { "data": this.programMemory[mapped.address] };
    }
    return false;
  }

  cpuWriteCart(address, data) {
    const mapped = this.mapper.mapWriteCPU(address);
    if (mapped) {
      if (mapped.address === 0xFFFFFFFF) {
        return true;
      }
      this.programMemory[mapped.address] = data;
      return true;
    }
    return false;
  }

  ppuReadCart(address) {
    const mapped = this.mapper.mapReadPPU(address);
    if (mapped) {
      return { "data": this.characterMemory[mapped.address] };
    }
    return false;
  }

  ppuWriteCart(address, data) {
    const mapped = this.mapper.mapWritePPU(address);
    if (mapped) {
      this.characterMemory[mapped.address] = data;
      return true;
    }
    return false;
  }

  reset() {
    if (this.mapper) {
      this.mapper.reset();
    }
  }

  getMirror() {
    if (Object.is(Mirror.HARDWARE, this.mapper.mirror())) {
      return this.mirror;
    }
    return this.mapper.mirror();
  }

  getMapper() {
    return this.mapper;
  }
}

class MemoryArea {
  memory;

  constructor(size = 32) {
    this.memory = new Uint8Array(size);
  }

  read(location) {
    return this.memory[location];
  }

  write(location, data) {
    this.memory[location] = data;
  }
}

/**
 *  The iNES Format Header. The .nes file format is the standard for distribution of NES binary programs. An iNES file
 *  consists of several sections, and a 16-byte header is one of them. This class represents that header.
 *  The first 4 bytes (0-3) are the constants $4E $45 $53 $1A
 *  Byte 5 (4) is the size of PRG ROM in 16 KB units.
 *  Byte 6 (5) is the size of CHR ROM in 8 KB units (value 0 means the board uses CHR RAM).
 *  Byte 7 (6) corresponds to Flags 6 – Mapper, mirroring, battery, trainer.
 *  Byte 8 (7) corresponds to Flags 7 – Mapper, VS/Playchoice, NES 2.0.
 *  Byte 9 (8) is the size of PRG RAM in 8 KB units.
 *  Byte 10 (9) corresponds to TV system of choice (0: NTSC; 1: PAL).
 *  Byte 11 (10) corresponds to TV system, PRG-RAM presence.
 *  Bytes 12-16 (11-15) is unused padding.
 */
class FormatHeader {
  header = new DataView(new ArrayBuffer(16));

  constructor(header) {
    for (let i = 0; i < 16; i++) {
      this.header.setUint8(i, header[i]);
    }
  }

  getProgramChunks() {
    return this.header.getUint8(4);
  }

  getCharacterChunks() {
    return this.header.getUint8(5);
  }

  getMapper1() {
    return this.header.getUint8(6);
  }

  getMapper2() {
    return this.header.getUint8(7);
  }
}

/**
 * The PPU status register. The first five bits are unused. This register informs about the rendering process.
 *
 * Bit 0-4: PPU open bus (unused).
 * Bit 5: Sprite overflow: This flag is set during sprite evaluation.
 * Bit 6: Sprite 0 hit: Set when a nonzero pixel of sprite 0 overlaps a nonzero background pixel. Used for raster timing.
 * Bit 7: Vertical blank has started (0: not in vblank; 1: in vblank).
 *
 */
class StatusRegister {
  status = new Uint8Array(1);

  setSpriteOverflow(value) {
    value === 0 ? this.status[0] &= ~(1 << 5) : this.status[0] |= (1 << 5);
  }

  setSpriteZeroHit(value) {
    value === 0 ? this.status[0] &= ~(1 << 6) : this.status[0] |= (1 << 6);
  }

  setVerticalBlank(value) {
    value === 0 ? this.status[0] &= ~(1 << 7) : this.status[0] |= (1 << 7);
  }

  getRegister() {
    return this.status[0];
  }

  setRegister(data) {
    this.status[0] = data;
  }
}

/**
 * The PPU control register.
 *
 * Bit 0: Name table X
 * Bit 1: Name table Y
 * Bit 2: Increment mode. VRAM address increment per CPU read/write of PPUDATA (0: add 1, going across; 1: add 32, going down).
 * Bit 3: Sprite pattern table address for 8x8 sprites.
 * Bit 4: Background pattern table address (0: $0000; 1: $1000).
 * Bit 5: Sprite size (0: 8x8 pixels; 1: 8x16 pixels).
 * Bit 6: Slave mode (unused).
 * Bit 7: Enable NMI. Generate an NMI at the start of the vertical blanking interval (0: off; 1: on).
 *
 */
class ControlRegister {
  control = new Uint8Array(1);

  getNameTableX() {
    return (this.control[0] & 0x01);
    //return (this.control[0] & 0x01) > 0 ? 1 : 0;
  }

  getNameTableY() {
    return (this.control[0] & 0x02) >> 1;
    //return (this.control[0] & 0x02) > 0 ? 1 : 0;
  }

  getIncrementMode() {
    return (this.control[0] & 0x04) >> 2;
    //return (this.control[0] & 0x04) > 0 ? 1 : 0;
  }

  getPatternSprite() {
    return (this.control[0] & 0x08) >> 3;
    //return (this.control[0] & 0x08) > 0 ? 1 : 0;
  }

  getPatternBackground() {
    return (this.control[0] & 0x10) >> 4;
    //return (this.control[0] & 0x10) > 0 ? 1 : 0;
  }

  getSpriteSize() {
    return (this.control[0] & 0x20) >> 5;
    //return (this.control[0] & 0x20) > 0 ? 1 : 0;
  }

  getEnableNMI() {
    return (this.control[0] & 0x80) >> 7;
    //return (this.control[0] & 0x80) > 0 ? 1 : 0;
  }

  setRegister(data) {
    this.control[0] = data;
  }
}

/**
 * The PPU mask register. This register is really just a series of switches that determine which parts of
 * the PPU are switched on or off.
 *
 * Bit 0: Greyscale (0: normal color, 1: produce a greyscale display).
 * Bit 1: Value 1: Show background in leftmost 8 pixels of screen, 0: Hide.
 * Bit 2: Value 1: Show sprites in leftmost 8 pixels of screen, 0: Hide.
 * Bit 3: Value 1: Show background.
 * Bit 4: Value 1: Show sprites.
 * Bit 5: Emphasize red (green on PAL/Dendy).
 * Bit 6: Emphasize green (red on PAL/Dendy).
 * Bit 7: Emphasize blue.
 */
class MaskRegister {
  mask = new Uint8Array(1);

  getGrayScale() {
    return (this.mask[0] & 0x01);
    //return (this.mask[0] & 0x01) > 0 ? 1 : 0;
  }

  getRenderBackgroundLeft() {
    return (this.mask[0] & 0x02) >> 1;
    //return (this.mask[0] & 0x02) > 0 ? 1 : 0;
  }

  getRenderSpritesLeft() {
    return (this.mask[0] & 0x04) >> 2;
    //return (this.mask[0] & 0x04) > 0 ? 1 : 0;
  }

  getRenderBackground() {
    return (this.mask[0] & 0x08) >> 3;
    //return (this.mask[0] & 0x08) > 0 ? 1 : 0;
  }

  getRenderSprites() {
    return (this.mask[0] & 0x10) >> 4;
    //return (this.mask[0] & 0x10) > 0 ? 1 : 0;
  }

  setRegister(data) {
    this.mask[0] = data;
  }
}

/**
 * The Loopy Register used by the PPU.
 *
 * Bits 0-4: Coarse X
 * Bits 5-9: Coarse Y
 * Bit 10: Name table X
 * Bit 11: Name table Y
 * Bit 12-14: Fine Y
 * Bit 15: Unused
 */
class LoopyRegister {
  loopy = new Uint16Array(1);

  getCoarseX() {
    return this.loopy[0] & 0x001F;
  }

  setCoarseX(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 0) : this.loopy[0] |= (1 << 0);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 1) : this.loopy[0] |= (1 << 1);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 2) : this.loopy[0] |= (1 << 2);
    (value & 0x8) === 0 ? this.loopy[0] &= ~(1 << 3) : this.loopy[0] |= (1 << 3);
    (value & 0x10) === 0 ? this.loopy[0] &= ~(1 << 4) : this.loopy[0] |= (1 << 4);
  }

  getCoarseY() {
    return (this.loopy[0] & 0x03E0) >> 5;
  }

  setCoarseY(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 5) : this.loopy[0] |= (1 << 5);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 6) : this.loopy[0] |= (1 << 6);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 7) : this.loopy[0] |= (1 << 7);
    (value & 0x8) === 0 ? this.loopy[0] &= ~(1 << 8) : this.loopy[0] |= (1 << 8);
    (value & 0x10) === 0 ? this.loopy[0] &= ~(1 << 9) : this.loopy[0] |= (1 << 9);
  }

  getNameTableX() {
    return (this.loopy[0] & 0x0400) >> 10;
  }

  setNameTableX(value) {
    value === 0 ? this.loopy[0] &= ~(1 << 10) : this.loopy[0] |= (1 << 10);
  }

  getNameTableY() {
    return (this.loopy[0] & 0x0800) >> 11;
  }

  setNameTableY(value) {
    value === 0 ? this.loopy[0] &= ~(1 << 11) : this.loopy[0] |= (1 << 11);
  }

  getFineY() {
    return (this.loopy[0] & 0x7000) >> 12;
  }

  setFineY(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 12) : this.loopy[0] |= (1 << 12);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 13) : this.loopy[0] |= (1 << 13);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 14) : this.loopy[0] |= (1 << 14);
  }

  getRegister() {
    return this.loopy[0];
  }

  setRegister(data) {
    this.loopy[0] = data;
  }
}

const cpu = new CPU();
const ppu = new PPU();
const bus = new Bus(cpu, ppu);

self.onmessage = function(message) {
  switch (message.data.event) {
    case 'press':
      do {
        bus.clock();
      } while (!bus.ppu.isFrameCompleted());
      bus.ppu.frameComplete = false;
      console.log('frame completed');
      break;
    case 'infinite':
      function loop() {
        do {
          bus.clock();
        } while (!bus.ppu.isFrameCompleted());
        bus.ppu.frameComplete = false;
        requestAnimationFrame(loop);
      }
        requestAnimationFrame(loop);
      break;
    case 'readFile':
      const rom = new Uint8Array(message.data.data);
      bus.insertCartridge(new Cartridge(rom));
      bus.reset();
      break;
    case 'keyup':
      switch (message.data.value) {
        case 'KeyX':
          bus.controllers[0] &= (~(1 << 7)) & 0xff;
          break;
        case 'KeyZ':
          bus.controllers[0] &= (~(1 << 6)) & 0xff;
          break;
        case 'KeyA':
          bus.controllers[0] &= (~(1 << 5)) & 0xff;
          break;
        case 'KeyS':
          bus.controllers[0] &= (~(1 << 4)) & 0xff;
          break;
        case 'ArrowUp':
          bus.controllers[0] &= (~(1 << 3)) & 0xff;
          break;
        case 'ArrowDown':
          bus.controllers[0] &= (~(1 << 2)) & 0xff;
          break;
        case 'ArrowLeft':
          bus.controllers[0] &= (~(1 << 1)) & 0xff;
          break;
        case 'ArrowRight':
          bus.controllers[0] &= (~(1 << 0)) & 0xff;
          break;
      }
      break;
    case 'keydown':
      switch (message.data.value) {
        case 'KeyX':
          bus.controllers[0] |= 0x80;
          break;
        case 'KeyZ':
          bus.controllers[0] |= 0x40;
          break;
        case 'KeyA':
          bus.controllers[0] |= 0x20;
          break;
        case 'KeyS':
          bus.controllers[0] |= 0x10;
          break;
        case 'ArrowUp':
          bus.controllers[0] |= 0x08;
          break;
        case 'ArrowDown':
          bus.controllers[0] |= 0x04;
          break;
        case 'ArrowLeft':
          bus.controllers[0] |= 0x02;
          break;
        case 'ArrowRight':
          bus.controllers[0] |= 0x01;
          break;
      }
      break;
    default:
      break;
  }

  if (message.data.canvas) {
    ppu.setContext(message.data.canvas.getContext("2d"));
  }
};
