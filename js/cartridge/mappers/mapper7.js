import { Mapper } from "./mapper.js";
import { Mirror } from "../../mirror.js";

/**
 * Mapper 7. The generic designation AxROM refers to Nintendo cartridge boards NES-AMROM, NES-ANROM, NES-AN1ROM,
 * NES-AOROM, their HVC counterparts, and clone boards. AxROM and compatible boards are implemented in
 * iNES format with iNES Mapper 7.
 *
 * CPU $8000-$FFFF: 32 KB switchable PRG ROM bank
 *
 * Example games:
 *
 * Battletoads
 * Cobra Triangle
 * R.C. Pro-AM
 * Aladdin
 * R.C. Pro-AM 2
 *
 */
export class MapperSeven extends Mapper {
  id = 7;
  mirrorMode = Mirror.HORIZONTAL;

  programBankSelect = 0;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      return { "address": this.programBankSelect * 0x8000 + (address & 0x7FFF) };
    }

    return false;
  }

  /**
   *
   * Bank select ($8000-$FFFF)
   * 7  bit  0
   * ---- ----
   * xxxM xPPP
   *    |  |||
   *    |  +++- Select 32 KB PRG ROM bank for CPU $8000-$FFFF
   *    +------ Select 1 KB VRAM page for all 4 nametables
   */
  mapWriteByCPU(address, data) {
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.programBankSelect = data & 0x07;

      if (data & 0x10) {
        this.mirrorMode = Mirror.SINGLE_SCREEN_LOW;
      } else {
        this.mirrorMode = Mirror.SINGLE_SCREEN_HIGH;
      }
    }

    return false;
  }

  mapReadByPPU(address) {
    if (address < 0x2000) {
      if (this.characterBanks === 0) {
        return { "address": address };
      }
      return { "address": this.programBankSelect * 0x2000 + address };
    }
    return false;
  }

  mapWriteByPPU(address) {
    if (address < 0x2000) {
      if (this.characterBanks === 0) {
        return { "address": address };
      }
      return true;
    }
    return false;
  }

  reset() {
    this.programBankSelect = 0;
  }

  mirror() {
    return this.mirrorMode;
  }
}
