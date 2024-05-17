import { Mapper } from "./mapper.js";

/**
 * Mapper 3
 */
export class MapperThree extends Mapper {
  id = 3;
  characterBankSelect = new Uint8Array(1);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      if (this.programBanks === 1) {                // 16K ROM
        const mappedAddress = address & 0x3FFF;
        return { "address": mappedAddress };
      }
      if (this.programBanks === 2) {              // 32K ROM
        const mappedAddress = address & 0x7FFF;
        return { "address": mappedAddress };
      }
      return true;
    }
    return false;
  }

  mapWriteCPU(address, data) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.characterBankSelect[0] = data & 0x03;
      return { "address": address };
    }
    return false;     // Mapper has handled write, but do not update ROMs
  }

  mapReadPPU(address) {
    if (address >= 0x0000 && address <= 0x1FFF) {
      const mappedAddress = this.characterBankSelect[0] * 0x2000 + address;
      return { "address": mappedAddress };
    }
    return false;
  }

  mapWritePPU(address) {
    return false;
  }

  reset() {
    this.characterBankSelect[0] = 0;
  }
}
