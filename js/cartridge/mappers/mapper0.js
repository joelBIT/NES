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
    return address & (this.programBanks > 1 ? 0x7FFF : 0x3FFF);
  }

  mapWriteByCPU(address) {
    return address & (this.programBanks > 1 ? 0x7FFF : 0x3FFF);
  }

  mapReadByPPU(address) {
    return address;
  }
}
