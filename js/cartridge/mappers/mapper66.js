import { Mapper } from "./mapper.js";

/**
 * Mapper 66. The designation GxROM refers to Nintendo cartridge boards labeled NES-GNROM and NES-MHROM (and their
 * HVC counterparts), which use discrete logic to provide up to four 32 KB banks of PRG ROM and up to four 8 KB banks of CHR ROM.
 *
 * CPU $8000-$FFFF: 32 KB switchable PRG ROM bank
 * PPU $0000-$1FFF: 8 KB switchable CHR ROM bank
 *
 * Example games:
 *
 * Doraemon
 * Dragon Power
 * Gumshoe
 * Thunder & Lightning
 * Super Mario Bros. + Duck Hunt (MHROM)
 *
 */
export class MapperSixtySix extends Mapper {
  id = 66;
  characterBank = 0;
  programBank = 0;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      return { "address": this.programBank * 0x8000 + (address & 0x7FFF) };
    }
    return false;
  }

  /**
   * Bank select ($8000-$FFFF)
   * 7  bit  0
   * ---- ----
   * xxPP xxCC
   *   ||   ||
   *   ||   ++- Select 8 KB CHR ROM bank for PPU $0000-$1FFF
   *   ++------ Select 32 KB PRG ROM bank for CPU $8000-$FFFF
   */
  mapWriteByCPU(address, data) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.characterBank = data & 0x03;
      this.programBank = (data & 0x30) >> 4;
    }
    return false;
  }

  mapReadByPPU(address) {
    if (address < 0x2000) {
      return { "address": this.characterBank * 0x2000 + address };
    }
    return false;
  }

  mapWriteByPPU(address) {
    if (address < 0x2000) {
      if (this.characterBanks === 0) {
        return { "address": address };
      }
    }
    return false;
  }

  reset() {
    this.characterBank = 0;
    this.programBank = 0;
  }
}
