import { Memory } from "./memory.js";

/**
 * Represents the Program memory of a cartridge. This memory consists of a number of memory banks, which are logical
 * segments of the data. A single bank of Program memory is 16kB (16384 bytes). This means that, for example, a 128kB
 * Program memory consists of 128/16 = 8 banks.
 */
export class ProgramROM extends Memory {
  banks;
  BANK_SIZE = 16384;

  constructor(data = []) {
    super(data);
    this.banks = data.length !== 0 ? Math.floor(data.length/this.BANK_SIZE) : 0;
  }

  numberOfBanks() {
    return this.banks;
  }
}
