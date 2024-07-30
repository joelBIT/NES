import { Mapper } from "./mapper.js";

/**
 * The iNES format assigns mapper 0 to NROM.
 *
 * CPU $6000-$7FFF: PRG RAM, mirrored as necessary to fill entire 8 KiB window
 * CPU $8000-$BFFF: First 16 KB of ROM.
 * CPU $C000-$FFFF: Last 16 KB of ROM (NROM-256) or mirror of $8000-$BFFF (NROM-128).
 *
 * Example games:
 *
 * Super Mario Bros
 * Balloon Fight
 * Donkey Kong
 * Ice Climber
 *
 */
export class MapperZero extends Mapper {
  id = 0;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      return { "address": address & (this.programBanks > 1 ? 0x7FFF : 0x3FFF) };
    }
    return false;
  }

  mapWriteByCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      return { "address": address & (this.programBanks > 1 ? 0x7FFF : 0x3FFF) };
    }
    return false;
  }

  mapReadByPPU(address) {
    if (address < 0x2000) {
      return { "address": address };
    }
    return false;
  }

  mapWriteByPPU(address) {
    if (address < 0x2000) {
      if (this.programBanks === 0) {
        return { "address": address };
      }
    }
    return false;
  }
}
