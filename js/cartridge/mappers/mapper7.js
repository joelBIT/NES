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
 * Battletoads & Double Dragon
 * R.C. Pro-AM 2
 *
 */
export class MapperSeven extends Mapper {
  id = 7;
  mirrorMode = Mirror.HORIZONTAL;
  programBank = 0;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    return this.programBank * this.THIRTY_TWO_KILOBYTES_BANK + (address & 0x7FFF);
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
    this.programBank = data & 0x07;

    if (data & 0x10) {
      this.mirrorMode = Mirror.SINGLE_SCREEN_LOW;
    } else {
      this.mirrorMode = Mirror.SINGLE_SCREEN_HIGH;
    }
  }

  mapReadByPPU(address) {
    return this.programBank * this.EIGHT_KILOBYTES_BANK + address;
  }

  mirror() {
    return this.mirrorMode;
  }

  reset() {
    this.programBank = 0;
  }
}
