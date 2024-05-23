import { Mirror } from "../mirror.js";
import { Mapper } from "./mapper.js";

/**
 * Mapper 4. The Nintendo MMC3 is a mapper ASIC used in Nintendo's TxROM Game Pak boards. Most common TxROM boards,
 * along with the NES-HKROM board (which uses the Nintendo MMC6), are assigned to iNES Mapper 004.
 *
 * CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
 * CPU $8000-$9FFF (or $C000-$DFFF): 8 KB switchable PRG ROM bank
 * CPU $A000-$BFFF: 8 KB switchable PRG ROM bank
 * CPU $C000-$DFFF (or $8000-$9FFF): 8 KB PRG ROM bank, fixed to the second-last bank
 * CPU $E000-$FFFF: 8 KB PRG ROM bank, fixed to the last bank
 * PPU $0000-$07FF (or $1000-$17FF): 2 KB switchable CHR bank
 * PPU $0800-$0FFF (or $1800-$1FFF): 2 KB switchable CHR bank
 * PPU $1000-$13FF (or $0000-$03FF): 1 KB switchable CHR bank
 * PPU $1400-$17FF (or $0400-$07FF): 1 KB switchable CHR bank
 * PPU $1800-$1BFF (or $0800-$0BFF): 1 KB switchable CHR bank
 * PPU $1C00-$1FFF (or $0C00-$0FFF): 1 KB switchable CHR bank
 *
 * Example games:
 *
 * Mega Man 3
 * Mega Man 5
 * Super Mario Bros 2
 * Super Mario Bros 3
 * Double Dragon 2
 * Double Dragon 3
 * Teenage Mutant Hero Turtles 2
 *
 */
export class MapperFour extends Mapper {
  id = 4;
  VRAM = new Uint8Array(32 * 1024);
  mirrorMode = Mirror.HORIZONTAL;

  targetRegister = new Uint8Array(1);
  programBankMode = false;
  characterInversion = false;

  register = new Uint32Array(8);
  characterBank = new Uint32Array(8);
  programBank = new Uint32Array(4);

  irqActive = false;
  irqEnable = false;
  irqUpdate = false;
  irqCounter = new Uint16Array(1);
  irqReload = new Uint16Array(1);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadCPU(address) {
    if (address >= 0x6000 && address <= 0x7FFF) {
      return { "address": 0xFFFFFFFF, "data": this.VRAM[address & 0x1FFF] };
    }

    if (address >= 0x8000 && address <= 0x9FFF) {
      return { "address": this.programBank[0] + (address & 0x1FFF) };
    }

    if (address >= 0xA000 && address <= 0xBFFF) {
      return { "address": this.programBank[1] + (address & 0x1FFF) };
    }

    if (address >= 0xC000 && address <= 0xDFFF) {
      return { "address": this.programBank[2] + (address & 0x1FFF) };
    }

    if (address >= 0xE000 && address <= 0xFFFF) {
      return { "address": this.programBank[3] + (address & 0x1FFF) };
    }

    return false;
  }

  mapWriteCPU(address, data) {
    if (address >= 0x6000 && address <= 0x7FFF) {
      this.VRAM[address & 0x1FFF] = data;
      return { "address": 0xFFFFFFFF };
    }

    if (address >= 0x8000 && address <= 0x9FFF) {
      // Bank Select
      if (!((address & 0x0001) > 0)) {
        this.targetRegister[0] = data & 0x07;
        this.programBankMode = (data & 0x40) > 0;
        this.characterInversion = (data & 0x80) > 0;
      } else {
        // Update target register
        this.register[this.targetRegister[0]] = data;

        // Update Pointer Table
        if (this.characterInversion) {
          this.characterBank[0] = this.register[2] * 0x0400;
          this.characterBank[1] = this.register[3] * 0x0400;
          this.characterBank[2] = this.register[4] * 0x0400;
          this.characterBank[3] = this.register[5] * 0x0400;
          this.characterBank[4] = (this.register[0] & 0xFE) * 0x0400;
          this.characterBank[5] = this.register[0] * 0x0400 + 0x0400;
          this.characterBank[6] = (this.register[1] & 0xFE) * 0x0400;
          this.characterBank[7] = this.register[1] * 0x0400 + 0x0400;
        } else {
          this.characterBank[0] = (this.register[0] & 0xFE) * 0x0400;
          this.characterBank[1] = this.register[0] * 0x0400 + 0x0400;
          this.characterBank[2] = (this.register[1] & 0xFE) * 0x0400;
          this.characterBank[3] = this.register[1] * 0x0400 + 0x0400;
          this.characterBank[4] = this.register[2] * 0x0400;
          this.characterBank[5] = this.register[3] * 0x0400;
          this.characterBank[6] = this.register[4] * 0x0400;
          this.characterBank[7] = this.register[5] * 0x0400;
        }

        if (this.programBankMode) {
          this.programBank[2] = (this.register[6] & 0x3F) * 0x2000;
          this.programBank[0] = (this.programBanks * 2 - 2) * 0x2000;
        } else {
          this.programBank[0] = (this.register[6] & 0x3F) * 0x2000;
          this.programBank[2] = (this.programBanks * 2 - 2) * 0x2000;
        }

        this.programBank[1] = (this.register[7] & 0x3F) * 0x2000;
        this.programBank[3] = (this.programBanks * 2 - 1) * 0x2000;

      }

      return false;
    }

    if (address >= 0xA000 && address <= 0xBFFF) {
      if (!((address & 0x0001) > 0)) {
        if (data & 0x01) {
          this.mirrorMode = Mirror.HORIZONTAL;
        } else {
          this.mirrorMode = Mirror.VERTICAL;
        }
      }
      return false;
    }

    if (address >= 0xC000 && address <= 0xDFFF) {
      if (!((address & 0x0001) > 0)) {
        this.irqReload[0] = data;
      } else {
        this.irqCounter[0] = 0x0000;
      }
      return false;
    }

    if (address >= 0xE000 && address <= 0xFFFF) {
      if (!((address & 0x0001) > 0)) {
        this.irqEnable = false;
        this.irqActive = false;
      } else {
        this.irqEnable = true;
      }
      return false;
    }
  }

  mapReadPPU(address) {
    if (address >= 0x0000 && address <= 0x03FF) {
      return { "address": this.characterBank[0] + (address & 0x03FF) };
    }

    if (address >= 0x0400 && address <= 0x07FF) {
      return { "address": this.characterBank[1] + (address & 0x03FF) };
    }

    if (address >= 0x0800 && address <= 0x0BFF) {
      return { "address": this.characterBank[2] + (address & 0x03FF) };
    }

    if (address >= 0x0C00 && address <= 0x0FFF) {
      return { "address": this.characterBank[3] + (address & 0x03FF) };
    }

    if (address >= 0x1000 && address <= 0x13FF) {
      return { "address": this.characterBank[4] + (address & 0x03FF) };
    }

    if (address >= 0x1400 && address <= 0x17FF) {
      return { "address": this.characterBank[5] + (address & 0x03FF) };
    }

    if (address >= 0x1800 && address <= 0x1BFF) {
      return { "address": this.characterBank[6] + (address & 0x03FF) };
    }

    if (address >= 0x1C00 && address <= 0x1FFF) {
      return { "address": this.characterBank[7] + (address & 0x03FF) };
    }

    return false;
  }

  mapWritePPU(address) {
    return false;
  }

  reset() {
    this.targetRegister[0] = 0x00;
    this.programBankMode = false;
    this.characterInversion = false;
    this.mirrorMode = Mirror.HORIZONTAL;

    this.irqActive = false;
    this.irqEnable = false;
    this.irqUpdate = false;
    this.irqCounter[0] = 0x0000;
    this.irqReload[0] = 0x0000;

    for (let i = 0; i < 4; i++) {
      this.programBank[i] = 0;
    }

    for (let i = 0; i < 8; i++) {
      this.characterBank[i] = 0;
      this.register[i] = 0;
    }

    this.programBank[0] = 0;
    this.programBank[1] = 1;
    this.programBank[2] = (this.programBanks * 2 - 2) * 0x2000;
    this.programBank[3] = (this.programBanks * 2 - 1) * 0x2000;
  }

  irqState() {
    return this.irqActive;
  }

  irqClear() {
    this.irqActive = false;
  }

  scanLine() {
    if (this.irqCounter[0] === 0) {
      this.irqCounter[0] = this.irqReload[0];
    } else {
      this.irqCounter[0]--;
    }

    if (this.irqCounter[0] === 0 && this.irqEnable) {
      this.irqActive = true;
    }
  }

  mirror() {
    return this.mirrorMode;
  }
}
