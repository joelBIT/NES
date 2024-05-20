import { Mapper } from "./mapper.js";

/**
 * Mapper 2
 *
 * CPU $8000-$BFFF: 16 KB switchable PRG ROM bank
 * CPU $C000-$FFFF: 16 KB PRG ROM bank, fixed to the last bank
 */
export class MapperTwo extends Mapper {
  id = 2;

  programBankSelectLow = 0;
  programBankSelectHigh = this.programBanks - 1;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadCPU(address) {
    if (address >= 0x8000 && address <= 0xBFFF) {
      return { "address": this.programBankSelectLow * 0x4000 + (address & 0x3FFF) };
    }

    if (address >= 0xC000 && address <= 0xFFFF) {
      return { "address": this.programBankSelectHigh * 0x4000 + (address & 0x3FFF) };
    }

    return false;
  }

  mapWriteCPU(address, data) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.programBankSelectLow = data & 0x0F;
    }

    return false;
  }

  mapReadPPU(address) {
    if (address < 0x2000) {
      return { "address": address };
    }
    return false;
  }

  mapWritePPU(address) {
    if (address < 0x2000) {
      if (this.characterBanks === 0) {
        return { "address": address };
      }
    }
    return false;
  }

  reset() {
    this.programBankSelectLow = 0;
    this.programBankSelectHigh = this.programBanks - 1;
  }
}
