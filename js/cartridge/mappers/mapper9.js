import { Mapper } from "./mapper.js";
import { Mirror } from "../../mirror.js";

/**
 * The iNES format assigns Mapper 9 (MMC2) to PxROM.
 *
 * CPU $6000-$7FFF: 8 KB PRG RAM bank (PlayChoice version only; contains a 6264 and 74139)
 * CPU $8000-$9FFF: 8 KB switchable PRG ROM bank
 * CPU $A000-$FFFF: Three 8 KB PRG ROM banks, fixed to the last three banks
 * PPU $0000-$0FFF: Two 4 KB switchable CHR ROM banks
 * PPU $1000-$1FFF: Two 4 KB switchable CHR ROM banks
 * The two 4 KB PPU banks each have two 4 KB banks, which can be switched during rendering by using the special
 * tiles $FD or $FE in either a sprite or the background.
 *
 * Example games:
 *
 * Punch-Out!!
 * Mike Tyson's Punch-Out!!
 *
 */
export class MapperNine extends Mapper {
  id = 9;
  mirrorMode = Mirror.VERTICAL;

  latchDataA = new Uint8Array(2);
  latchDataB = new Uint8Array(2);

  chrLatchA = 0xFE;
  chrLatchB = 0xFE;

  programBank = new Uint8Array(4);
  characterBank = new Uint8Array(2);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  /**
   *
   * CPU $8000-$9FFF: 8 KB switchable PRG ROM bank
   * CPU $A000-$FFFF: Three 8 KB PRG ROM banks, fixed to the last three banks
   *
   * @param address       the address to be converted
   * @returns {number}    the converted address
   */
  mapReadByCPU(address) {
    if (address >= 0x8000 && address <= 0x9FFF) {
      return this.programBank[0] * this.EIGHT_KILOBYTES_BANK + (address & 0x1FFF);
    }

    if (address >= 0xA000 && address <= 0xBFFF) {
      return this.programBank[1] * this.EIGHT_KILOBYTES_BANK + (address & 0x1FFF);
    }

    if (address >= 0xC000 && address <= 0xDFFF) {
      return this.programBank[2] * this.EIGHT_KILOBYTES_BANK + (address & 0x1FFF);
    }

    if (address >= 0xE000 && address <= 0xFFFF) {
      return this.programBank[3] * this.EIGHT_KILOBYTES_BANK + (address & 0x1FFF);
    }
  }

  mapWriteByCPU(address, data) {
    /**
     *  PRG ROM bank select ($A000-$AFFF)
     *  7  bit  0
     *  ---- ----
     *  xxxx PPPP
     *       ||||
     *       ++++- Select 8 KB PRG ROM bank for CPU $8000-$9FFF
     *
     */
    if (address >= 0xA000 && address <= 0xAFFF) {
      this.programBank[0] = (data & 0x0F);
    }

    /**
     *  CHR ROM $FD/0000 bank select ($B000-$BFFF)
     *  7  bit  0
     *  ---- ----
     *  xxxC CCCC
     *     | ||||
     *     +-++++- Select 4 KB CHR ROM bank for PPU $0000-$0FFF used when latch 0 = $FD
     *
     */
    if (address >= 0xB000 && address <= 0xBFFF) {
      this.latchDataA[0] = data & 0x1F;
      if (this.chrLatchA === 0xFD) {
        this.characterBank[0] = this.latchDataA[0];
      } else if (this.chrLatchA === 0xFE) {
        this.characterBank[0] = this.latchDataA[1];
      }
    }

    /**
     *  CHR ROM $FE/0000 bank select ($C000-$CFFF)
     *  7  bit  0
     *  ---- ----
     *  xxxC CCCC
     *     | ||||
     *     +-++++- Select 4 KB CHR ROM bank for PPU $0000-$0FFF used when latch 0 = $FE
     *
     */
    if (address >= 0xC000 && address <= 0xCFFF) {
      this.latchDataA[1] = data & 0x1F;
      if (this.chrLatchA === 0xFD) {
        this.characterBank[0] = this.latchDataA[0];
      } else if (this.chrLatchA === 0xFE) {
        this.characterBank[0] = this.latchDataA[1];
      }
    }

    /**
     *  CHR ROM $FD/1000 bank select ($D000-$DFFF)
     *  7  bit  0
     *  ---- ----
     *  xxxC CCCC
     *     | ||||
     *     +-++++- Select 4 KB CHR ROM bank for PPU $1000-$1FFF used when latch 1 = $FD
     *
     */
    if (address >= 0xD000 && address <= 0xDFFF) {
      this.latchDataB[0] = data & 0x1F;
      if (this.chrLatchB === 0xFD) {
        this.characterBank[1] = this.latchDataB[0];
      } else if (this.chrLatchB === 0xFE) {
        this.characterBank[1] = this.latchDataB[1];
      }
    }

    /**
     *  CHR ROM $FE/1000 bank select ($E000-$EFFF)
     *  7  bit  0
     *  ---- ----
     *  xxxC CCCC
     *     | ||||
     *     +-++++- Select 4 KB CHR ROM bank for PPU $1000-$1FFF used when latch 1 = $FE
     *
     */
    if (address >= 0xE000 && address <= 0xEFFF) {
      this.latchDataB[1] = data & 0x1F;
      if (this.chrLatchB === 0xFD) {
        this.characterBank[1] = this.latchDataB[0];
      } else if (this.chrLatchB === 0xFE) {
        this.characterBank[1] = this.latchDataB[1];
      }
    }

    /**
     *  Mirroring ($F000-$FFFF)
     *  7  bit  0
     *  ---- ----
     *  xxxx xxxM
     *          |
     *          +- Select nametable mirroring (0: vertical; 1: horizontal)
     *
     */
    if (address >= 0xF000 && address <= 0xFFFF) {
      this.mirrorMode = data & 0x01 === 0 ? Mirror.VERTICAL : Mirror.HORIZONTAL;
    }
  }

  /**
   * PPU reads $0FD8: latch 0 is set to $FD for subsequent reads
   * PPU reads $0FE8: latch 0 is set to $FE for subsequent reads
   * PPU reads $1FD8 through $1FDF: latch 1 is set to $FD for subsequent reads
   * PPU reads $1FE8 through $1FEF: latch 1 is set to $FE for subsequent reads
   */
  mapReadByPPU(address) {
      if (address === 0x0FD8) {
        this.chrLatchA = 0xFD;
        this.characterBank[0] = this.latchDataA[0];
      } else if (address === 0x0FE8) {
        this.chrLatchA = 0xFE;
        this.characterBank[0] = this.latchDataA[1];
      } else if (address >= 0x1FD8 && address <= 0x1FDF) {
        this.chrLatchB = 0xFD;
        this.characterBank[1] = this.latchDataB[0];
      } else if (address >= 0x1FE8 && address <= 0x1FEF) {
        this.chrLatchB = 0xFE;
        this.characterBank[1] = this.latchDataB[1];
      }
      if (address <= 0x0FFF) {
        return this.characterBank[0] * this.FOUR_KILOBYTES_BANK + (address & 0x0FFF);
      }

      return this.characterBank[1] * this.FOUR_KILOBYTES_BANK + (address & 0x0FFF);
  }

  mirror() {
    return this.mirrorMode;
  }

  reset() {
    this.mirrorMode = Mirror.VERTICAL;

    this.programBank[0] = 0;
    this.programBank[1] = this.programBanks * 2 - 3;
    this.programBank[2] = this.programBanks * 2 - 2;
    this.programBank[3] = this.programBanks * 2 - 1;
    this.characterBank[0] = 0;
    this.characterBank[1] = 1;

    this.latchDataA = new Uint8Array(2);
    this.latchDataB = new Uint8Array(2);

    this.chrLatchA = 0xFE;
    this.chrLatchB = 0xFE;
  }
}
