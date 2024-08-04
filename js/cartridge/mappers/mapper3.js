import { Mapper } from "./mapper.js";

/**
 * Mapper 3 is used to designate the CNROM board, and similar boards used by Bandai, Panesian, Sachen and others,
 * generalized to support up to 256 banks (2048 KiB) of CHR ROM.
 *
 * PPU $0000-$1FFF: 8 KB switchable CHR ROM bank
 *
 * Example games:
 *
 * Solomon's Key
 * Arkanoid
 * Arkista's Ring
 * Bump 'n' Jump
 * Donkey Kong Classics
 *
 */
export class MapperThree extends Mapper {
  id = 3;
  characterBank = 0;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    if (this.programBanks === 1) {
      return address & 0x3FFF;
    }
    if (this.programBanks === 2) {
      return address & 0x7FFF;
    }
  }

  /**
   *
   * Bank select ($8000-$FFFF)
   * 7  bit  0
   * ---- ----
   * cccc ccCC
   * |||| ||||
   * ++++-++++- Select 8 KB CHR ROM bank for PPU $0000-$1FFF
   *
   * CNROM only implements the lowest 2 bits, capping it at 32 KiB CHR. Other boards may implement 4 or more
   * bits for larger CHR.
   */
  mapWriteByCPU(address, data) {
    this.characterBank = data & 0x03;
  }

  mapReadByPPU(address) {
    return this.characterBank * this.EIGHT_KILOBYTES_BANK + address;
  }

  reset() {
    this.characterBank = 0;
  }
}
