import { Mapper } from "./mapper.js";
import { Mirror } from "../../mirror.js";
import { ProgramRAM } from "../memory/ProgramRAM.js";

/**
 * The Sunsoft FME-7 is a mapper IC used by Sunsoft in several of its games. It is nearly identical to the Sunsoft 5A
 * and Sunsoft 5B mapper chips used only in Famicom games. The FME-7, 5A and 5B are grouped together as iNES Mapper 69.
 *
 *
 * Example games:
 *
 * Batman: Return of the Joker
 * Gremlins 2: Shinshu Tanjou
 * Barcode World
 * Mr Gimmick
 *
 */
export class MapperSixtyNine extends Mapper {
  id = 69;
  mirrorMode = Mirror.HORIZONTAL;
  commandRegister = new Uint8Array(1);

  programRamEnabled = false;
  programRamSelected = false;   // If false, program ROM is selected
  programRamBank = 0;
  programMemoryMask = 0x0F;

  ppuCycles = 0;
  irqEnabled = false;
  counterEnabled = false;
  irqActive = false;
  counter = new Uint16Array(1);

  characterBank = new Uint8Array(8);
  programBank = new Uint8Array(4);
  programRAM = new ProgramRAM();

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

  /**
   * CPU $6000-$7FFF: 8 KB Bankable PRG ROM or PRG RAM
   * CPU $8000-$9FFF: 8 KB Bankable PRG ROM
   * CPU $A000-$BFFF: 8 KB Bankable PRG ROM
   * CPU $C000-$DFFF: 8 KB Bankable PRG ROM
   * CPU $E000-$FFFF: 8 KB PRG ROM, fixed to the last bank of ROM
   */
  mapReadByCPU(address) {
    if (address >= 0x6000 && address <= 0x7FFF) {
      if (this.programRamSelected && this.programRamEnabled) {
        return this.programRAM.read(address & 0x1FFF);
      }
      if (this.programRamSelected && !this.programRamEnabled) {
        return 0x00;
      }
      return this.programRamBank * this.EIGHT_KILOBYTES_BANK + (address & 0x1FFF);
    }

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

  /**
   * Command Register ($8000-$9FFF)
   * 7  bit  0
   * ---- ----
   * .... CCCC
   *      ||||
   *      ++++- The command number to invoke when writing to the Parameter Register
   *
   * Parameter Register ($A000-$BFFF)
   * 7  bit  0
   * ---- ----
   * PPPP PPPP
   * |||| ||||
   * ++++-++++- The parameter to use for this command. Writing to this register invokes the command in the Command Register.
   *
   */
  mapWriteByCPU(address, data) {
    if (address >= 0x6000 && address <= 0x7FFF) {
      if (this.programRamSelected && this.programRamEnabled) {
        this.programRAM.write(address & 0x1FFF, data);
      }
    }

    if (address >= 0x8000 && address <= 0x9FFF) {
      this.commandRegister[0] = data & 0x0F;
    }

    if (address >= 0xA000 && address <= 0xBFFF) {
      switch (this.commandRegister[0]) {
        case 0x0:
        case 0x1:
        case 0x2:
        case 0x3:
        case 0x4:
        case 0x5:
        case 0x6:
        case 0x7:
          this.characterBank[this.commandRegister[0]] = data;
          break;
        case 0x8:
          this.programRamSelected = data & 0x40;
          this.programRamEnabled = data & 0x80;
          this.programRamBank = data & 0x1F;
          break;
        case 0x9:
          this.programBank[0] = data & this.programMemoryMask;
          break;
        case 0xA:
          this.programBank[1] = data & this.programMemoryMask;
          break;
        case 0xB:
          this.programBank[2] = data & this.programMemoryMask;
          break;
        case 0xC:
          switch (data & 0x03) {
            case 0:
              this.mirrorMode = Mirror.VERTICAL;
              break;
            case 1:
              this.mirrorMode = Mirror.HORIZONTAL;
              break;
            case 2:
              this.mirrorMode = Mirror.SINGLE_SCREEN_LOW;
              break;
            case 3:
              this.mirrorMode = Mirror.SINGLE_SCREEN_HIGH;
              break;
          }
          break;
        case 0xD:
          this.irqEnabled = data & 0x01;
          this.counterEnabled = data & 0x80;
          break;
        case 0xE:
          this.counter[0] = (this.counter[0] & 0xFF00) | data;
          break;
        case 0xF:
          this.counter[0] = (this.counter[0] & 0x00FF) | (data << 8);
          break;
      }
    }
  }

  mapReadByPPU(address) {
    if (address <= 0x03FF) {
      return this.characterBank[0] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }

    if (address <= 0x07FF) {
      return this.characterBank[1] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }

    if (address <= 0x0BFF) {
      return this.characterBank[2] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }

    if (address <= 0x0FFF) {
      return this.characterBank[3] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }

    if (address <= 0x13FF) {
      return this.characterBank[4] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }

    if (address <= 0x17FF) {
      return this.characterBank[5] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }

    if (address <= 0x1BFF) {
      return this.characterBank[6] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }

    if (address <= 0x1FFF) {
      return this.characterBank[7] * this.ONE_KILOBYTE_BANK + (address & 0x03FF);
    }
  }

  irqState() {
    return this.irqActive;
  }

  irqClear() {
    this.irqActive = false;
  }

  handlesProgramRAM() {
    return !this.programRamEnabled;
  }

  hasCycleCounter() {
    return true;
  }

  /**
   * There are 3 PPU cycles for each CPU cycle, so the ppuCycles variable keeps track of how many CPU cycles has been
   * executed.
   */
  tickCycleCounter() {
    if (this.irqEnabled && this.counterEnabled) {
      this.ppuCycles++;
      if (this.ppuCycles % 3 === 0) {
        if (this.counter[0] === 0xFFFF) {
          this.counter[0] = 0x0000;
          this.irqActive = true;
        } else {
          this.counter[0]--;
        }
        this.ppuCycles = 0;   // Reset PPU cycles so it never exceeds value 3
      }
    }
  }

  mirror() {
    return this.mirrorMode;
  }

  reset() {
    for (let i = 0; i <  this.characterBank.length; i++) {
      this.characterBank[i] = i;
    }

    this.programBank[0] = 0;
    this.programBank[1] = 0;
    this.programBank[2] = 0;
    this.programBank[3] = (this.programBanks * 2 - 1);    // Fixed to the last bank, never changes
    this.commandRegister[0] = 0;

    this.irqEnabled = false;
    this.counterEnabled = false;
    this.irqActive = false;
    this.counter[0] = 0x0000;

    this.programRamEnabled = false;
    this.programRamSelected = false;   // If false, program ROM is selected
    this.programMemoryMask = this.programBanks === 16 ? 0x1F : 0x0F;
    this.programRamBank = 0;
    this.programRAM = new ProgramRAM();
  }
}
