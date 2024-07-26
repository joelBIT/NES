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

  programBankSelectLow = 0;
  programBankSelectHigh = this.programBanks - 1;

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    if (address >= 0x8000 && address <= 0xBFFF) {
      return { "address": this.programBankSelectLow * 0x4000 + (address & 0x3FFF) };
    }

    if (address >= 0xC000 && address <= 0xFFFF) {
      return { "address": this.programBankSelectHigh * 0x4000 + (address & 0x3FFF) };
    }

    return false;
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
    if (address >= 0x8000 && address <= 0xFFFF) {
      this.programBankSelectLow = data & 0x0F;
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
      if (this.characterBanks === 0) {
        return { "address": address };
      }
    }
    return false;
  }

  reset() {
    this.programBankSelectLow = 0;
    this.programBankSelectHigh = this.programBanks - 1;
  }

  mirror() {
    return this.mirrorMode;
  }
}
