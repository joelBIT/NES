import { Mapper } from "./mapper.js";

/**
 * Mapper 0
 */
export class MapperZero extends Mapper {
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
