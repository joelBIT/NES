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
