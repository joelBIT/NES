/**
 * An instruction contains information for a CPU about how to perform a task.
 *
 * name: the instruction's operation code
 * cycles: the number of clock cycles required to finish execution
 * operation: the operation to be performed
 * addressMode: the addressing mode used in this instruction
 */
export class Instruction {
  constructor(name, cycles, operation, addressMode) {
    this.name = name;
    this.cycles = cycles;
    this.operation = operation;
    this.addressMode = addressMode;
  }
}

/**
 * Addressing modes provide different ways to access memory locations. Some addressing modes operate on the
 * contents of cpu, rather than memory.
 *
 * name: the name of the address mode
 * operation: the operation to be performed
 */
export class AddressMode {
  constructor(name, operation) {
    this.name = name;
    this.operation = operation;
  }
}
