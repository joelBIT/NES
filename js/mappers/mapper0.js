import { Mapper } from "./mapper.js";

/**
 * The iNES format assigns mapper 0 to NROM.
 *
 * CPU $6000-$7FFF: Family Basic only: PRG RAM, mirrored as necessary to fill entire 8 KiB window, write protectable with an external switch
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
