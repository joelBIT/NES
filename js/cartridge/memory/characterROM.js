import { Memory } from "./memory.js";

/**
 * Represents the Character memory of a cartridge. Some cartridges have a CHR ROM, which holds a fixed set of graphics
 * tile data available to the PPU from the moment it turns on.This memory consists of a number of memory banks, which
 * are logical segments of the data. A single bank of Character memory is 8kB (8192 bytes). This means that, for example,
 * a 128kB Character memory consists of 128/8 = 16 banks.
 */
export class CharacterROM extends Memory {
  banks;
  BANK_SIZE = 8192;

  constructor(data = []) {
    super(data);
    this.banks = data.length !== 0 ? Math.floor(data.length/this.BANK_SIZE) : 0;
  }

  numberOfBanks() {
    return this.banks;
  }
}
