import { Mapper } from "./mapper.js";
import { Mirror } from "../../mirror.js";

/**
 * Mapper 2 is the implementation of the most common usage of UxROM compatible boards.
 *
 * CPU $8000-$BFFF: 16 KB switchable PRG ROM bank
 * CPU $C000-$FFFF: 16 KB PRG ROM bank, fixed to the last bank
 *
 * Example games:
 *
 * Mega Man
 * Castlevania
 * Contra
 * Duck Tales
 * Metal Gear
 */
export class MapperTwo extends Mapper {
  id = 2;
  mirrorMode = Mirror.VERTICAL;
  programBank = new Uint8Array(2);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    if (address >= 0x8000 && address <= 0xBFFF) {
      return this.programBank[0] * this.SIXTEEN_KILOBYTES_BANK + (address & 0x3FFF);
    }

    if (address >= 0xC000 && address <= 0xFFFF) {
      return this.programBank[1] * this.SIXTEEN_KILOBYTES_BANK + (address & 0x3FFF);
    }
  }

  /**
   *
   * Bank select ($8000-$FFFF)
   * 7  bit  0
   * ---- ----
   * xxxx pPPP
   *      ||||
   *      ++++- Select 16 KB PRG ROM bank for CPU $8000-$BFFF
   *
   * (UNROM uses bits 2-0; UOROM uses bits 3-0)
   */
  mapWriteByCPU(address, data) {
    this.programBank[0] = data & 0x0F;
  }

  mapReadByPPU(address) {
    return address;
  }

  mirror() {
    return this.mirrorMode;
  }

  reset() {
    this.programBank[0] = 0;
    this.programBank[1] = this.programBanks - 1;
  }
}
