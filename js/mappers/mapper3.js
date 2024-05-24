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
        return { "address": address & 0x3FFF };
      }
      if (this.programBanks === 2) {              // 32K ROM
        return { "address": address & 0x7FFF };
      }
      return true;
    }
    return false;
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
  mapWriteCPU(address, data) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.characterBankSelect[0] = data & 0x03;
      return { "address": address };
    }
    return false;
  }

  mapReadPPU(address) {
    if (address < 0x2000) {
      return { "address": this.characterBankSelect[0] * 0x2000 + address };
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
