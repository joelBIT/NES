import { Mapper } from "./mapper.js";

/**
 * Mapper 66
 */
export class MapperSixtySix extends Mapper {
  id = 66;

  characterBankSelect = new Uint8Array(1);
  programBankSelect = new Uint8Array(1);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      return { "address": this.programBankSelect[0] * 0x8000 + (address & 0x7FFF) };
    }
    return false;
  }

  mapWriteCPU(address, data) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.characterBankSelect[0] = data & 0x03;
      this.programBankSelect[0] = (data & 0x30) >> 4;
    }
    return false;
  }

  mapReadPPU(address) {
    if (address >= 0x0000 && address <= 0x1FFF) {
      return { "address": this.characterBankSelect[0] * 0x2000 + address };
    }
    return false;
  }

  mapWritePPU(address) {
    return false;
  }

  reset() {
    this.characterBankSelect[0] = 0;
    this.programBankSelect[0] = 0;
  }
}
