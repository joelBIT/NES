import { Mirror } from "../mirror.js";
import { Mapper } from "./mapper.js";

/**
 * Mapper 1 is used to designate the SxROM boardset, all of which use Nintendo's MMC1.
 *
 * CPU $6000-$7FFF: 8 KB PRG RAM bank, (optional)
 * CPU $8000-$BFFF: 16 KB PRG ROM bank, either switchable or fixed to the first bank
 * CPU $C000-$FFFF: 16 KB PRG ROM bank, either fixed to the last bank or switchable
 * PPU $0000-$0FFF: 4 KB switchable CHR bank
 * PPU $1000-$1FFF: 4 KB switchable CHR bank
 * Through writes to the MMC1 control register, it is possible for the program to swap the fixed and switchable PRG ROM
 * banks or to set up 32 KB PRG bankswitching (like BNROM), but most games use the default setup, which is similar to that of UxROM.
 *
 * Example games:
 *
 * The Legend of Zelda
 * Mega Man 2
 * Metroid
 * Teenage Mutant Ninja Turtles
 * Castlevania 2
 * Chip n' Dale
 * Double Dragon
 *
 */
export class MapperOne extends Mapper {
  id = 1;
  VRAM = new Uint8Array(32*1024);     // Could be dumped into a file for game save?
  mirrorMode = Mirror.HORIZONTAL;

  shiftRegister = new Uint8Array(1);
  writeCounter = new Uint8Array(1);
  controlRegister = new Uint8Array(1);

  programBankSelect32 = new Uint8Array(1);
  programBankSelect16Low = new Uint8Array(1);
  programBankSelect16High = new Uint8Array(1);

  characterBankSelect4Low = new Uint8Array(1);
  characterBankSelect4High = new Uint8Array(1);
  characterBankSelect8 = new Uint8Array(1);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  mapReadByCPU(address) {
    if (address >= 0x6000 && address <= 0x7FFF) {
      return { "address": 0xFFFFFFFF, "data": this.VRAM[address & 0x1FFF] };      // Read is from static ram on cartridge
    }
    if (address >= 0x8000) {
      if (this.controlRegister[0] & 0x08) {        // 16K Mode
        if (address >= 0x8000 && address <= 0xBFFF) {
          return { "address": this.programBankSelect16Low[0] * 0x4000 + (address & 0x3FFF) };
        }
        if (address >= 0xC000 && address <= 0xFFFF) {
          return { "address": this.programBankSelect16High[0] * 0x4000 + (address & 0x3FFF) };
        }
      } else {      // 32K Mode
        return { "address": this.programBankSelect32[0] * 0x8000 + (address & 0x7FFF) };
      }
    }
    return false;
  }

  mapWriteByCPU(address, data) {
    if (address >= 0x6000 && address <= 0x7FFF) {
      this.VRAM[address & 0x1FFF] = data;       // Write is to static ram on cartridge
      return { "address": 0xFFFFFFFF };
    }

    if (address >= 0x8000) {
      if (data & 0x80) {

        // MSB is set, so reset serial loading
        this.shiftRegister[0] = 0x10;
        this.writeCounter[0] = 0;
        this.controlRegister[0] = this.controlRegister[0] | 0x0C;
      } else {
        // Load data in serially into shift register
        // It arrives LSB first, so implant this at bit 5. After 5 writes, the register is ready
        this.shiftRegister[0] = (this.shiftRegister[0] >> 1) | ((data & 0x01) << 4);
        this.writeCounter[0]++;

        if (this.writeCounter[0] === 5) {
          // Get Mapper Target Register, by examining bits 13 & 14 of the address
          const targetRegister = (address >> 13) & 0x03;

          if (targetRegister === 0) {     // 0x8000 - 0x9FFF
            // Set Control Register
            this.controlRegister[0] = this.shiftRegister[0] & 0x1F;

            switch (this.controlRegister[0] & 0x03) {
              case 0:
                this.mirrorMode = Mirror.SINGLE_SCREEN_LOW;
                break;
              case 1:
                this.mirrorMode = Mirror.SINGLE_SCREEN_HIGH;
                break;
              case 2:
                this.mirrorMode = Mirror.VERTICAL;
                break;
              case 3:
                this.mirrorMode = Mirror.HORIZONTAL;
                break;
            }
          } else if (targetRegister === 1) {      // 0xA000 - 0xBFFF
            if (this.controlRegister[0] & 0x10) {
              this.characterBankSelect4Low[0] = this.shiftRegister[0] & 0x1F;      // 4K CHR Bank at PPU 0x0000
            } else {
              this.characterBankSelect8[0] = this.shiftRegister[0] & 0x1E;        // 8K CHR Bank at PPU 0x0000
            }
          } else if (targetRegister === 2) {      // 0xC000 - 0xDFFF
            if (this.controlRegister[0] & 0x10) {
              this.characterBankSelect4High[0] = this.shiftRegister[0] & 0x1F;      // 4K CHR Bank at PPU 0x1000
            }
          } else if (targetRegister === 3) {      // 0xE000 - 0xFFFF
            // Configure PRG Banks

            const programMode = (this.controlRegister[0] >> 2) & 0x03;
            if (programMode === 0 || programMode === 1) {
              this.programBankSelect32[0] = (this.shiftRegister[0] & 0x0E) >> 1;  // Set 32K PRG Bank at CPU 0x8000
            } else if (programMode === 2) {
              this.programBankSelect16Low[0] = 0;                              // Fix 16KB PRG Bank at CPU 0x8000 to First Bank
              this.programBankSelect16High[0] = this.shiftRegister[0] & 0x0F;   // Set 16KB PRG Bank at CPU 0xC000
            } else if (programMode === 3) {
              this.programBankSelect16Low[0] = this.shiftRegister[0] & 0x0F;                 // Set 16KB PRG Bank at CPU 0x8000
              this.programBankSelect16High[0] = this.programBanks - 1;                      // Fix 16KB PRG Bank at CPU 0xC000 to Last Bank
            }
          }
          // 5 bits were written, and decoded, so reset shift register
          this.shiftRegister[0] = 0x00;
          this.writeCounter[0] = 0;
        }
      }
    }

    return false;
  }

  mapReadByPPU(address) {
    if (address < 0x2000) {
      if (this.characterBanks === 0) {
        return { "address": address };
      }
      if (this.controlRegister[0] & 0x10) {        // 4K CHR Bank Mode
        if (address <= 0x0FFF) {
          return { "address": this.characterBankSelect4Low[0] * 0x1000 + (address & 0x0FFF) };
        }
        if (address >= 0x1000 && address <= 0x1FFF) {
          return { "address": this.characterBankSelect4High[0] * 0x1000 + (address & 0x0FFF) };
        }
      } else {      // 8K CHR Bank Mode
        return { "address": this.characterBankSelect8[0] * 0x2000 + address };
      }
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
    this.controlRegister[0] = 0x1C;
    this.shiftRegister[0] = 0x00;
    this.writeCounter[0] = 0x00;

    this.characterBankSelect4Low[0] = 0;
    this.characterBankSelect4High[0] = 0;
    this.characterBankSelect8[0] = 0;

    this.programBankSelect32[0] = 0;
    this.programBankSelect16Low[0] = 0;
    this.programBankSelect16High[0] = this.programBanks - 1;
  }

  mirror() {
    return this.mirrorMode;
  }
}
