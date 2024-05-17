import { Mapper } from "./mapper.js";

/**
 * Mapper 2
 */
export class MapperTwo extends Mapper {
  id = 2;

  programBankSelectLow = new Uint8Array(1);
  programBankSelectHigh = new Uint8Array(1);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadCPU(address) {
    if (address >= 0x8000 && address <= 0xBFFF) {
      return { "address": this.programBankSelectLow[0] * 0x4000 + (address & 0x3FFF) };
    }

    if (address >= 0xC000 && address <= 0xFFFF) {
      return { "address": this.programBankSelectHigh[0] * 0x4000 + (address & 0x3FFF) };
    }

    return false;
  }

  mapWriteCPU(address, data) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.programBankSelectLow[0] = data & 0x0F;
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
      if (this.characterBanks === 0) {
        return { "address": address };
      }
    }
    return false;
  }

  reset() {
    this.programBankSelectLow[0] = 0;
    this.programBankSelectHigh[0] = this.programBanks - 1;
  }
}
