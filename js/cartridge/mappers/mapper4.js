import { Mirror } from "../../mirror.js";
import { Mapper } from "./mapper.js";

/**
 *  MMC3 has only 6-bit bank registers, hence a 512 KiB PRG-ROM limit.
 */
class BankRegister {
  register = new Uint32Array(8);
  programBanksMask = 0x1F;

  getRegisterData(register) {
    return this.register[register];
  }

  /**
   * Decide mask for converting 16kb program banks into 8kb banks for bank swapping.
   *
   * @param programBanks are in sizes of 16kb
   */
  setNumberOfProgramBanks(programBanks) {
    if (programBanks <= 8) {
      this.programBanksMask = 0xF;    // 16 (0 - 15) 8kb banks
    } else if (programBanks === 16) {
      this.programBanksMask = 0x1F;   // 32 (0 - 31) 8kb banks
    } else if (programBanks === 32) {
      this.programBanksMask = 0x3F;   // 64 (0 - 63) 8kb banks
    }
  }

  /**
   * R6 and R7 will ignore the top two bits, as the MMC3 has only 6 PRG ROM address lines. The programBanksMask is used
   * to convert the data parameter into a value that is within the valid range of 8kb banks used for the current game.
   * R0 and R1 ignore the bottom bit, as the value written still counts banks in 1KB units but odd numbered banks
   * cannot be selected.
   */
  setData(register, data) {
    if (register === 6 || register === 7) {
      this.register[register] = data & this.programBanksMask;
    } else {
      this.register[register] = data;
    }
  }

  /**
   * The six registers 0 - 5 are for the four 1k character banks and the two 2kb character banks. Register
   * 6 and 7 are for the switchable 8kb program banks. The reset values are the start values for the registers so that
   * the size of each bank becomes the corresponding 1kb, 2kb and 8kb during bank updates. The ONE_KILOBYTE and
   * EIGHT_KILOBYTE constants are used when the actual updates of the banks occur to achieve the correct bank size.
   * This means that each increment of the value in registers 0 - 5 correspond to 1kb, and each increment in register
   * 6 and 7 corresponds to 8kb.
   */
  reset() {
    this.programBanksMask = 0x1F;
    this.register[0] = 0;   // 2kb character bank
    this.register[1] = 2;   // 2kb character bank, value is 2 because register 0 corresponds to a 2kb bank
    this.register[2] = 4;   // 1kb character bank, value is 4 because register 1 corresponds to a 2kb bank
    this.register[3] = 5;   // 1kb character bank
    this.register[4] = 6;   // 1kb character bank
    this.register[5] = 7;   // 1kb character bank
    this.register[6] = 0;   // 8kb switchable program bank
    this.register[7] = 1;   // 8kb switchable program bank
  }
}


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
  mirrorMode = Mirror.HORIZONTAL;

  programBankMode = false;
  characterInversion = false;

  bankRegister = new BankRegister();
  targetBankRegister = 0;
  characterBank = new Uint32Array(8);
  programBank = new Uint8Array(4);

  irqActive = false;
  irqEnabled = false;
  irqCounter = new Uint16Array(1);
  irqLatch = new Uint16Array(1);

  constructor(programBanks, characterBanks) {
    super(programBanks, characterBanks);
  }

  getId() {
    return this.id;
  }

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

  /**
   * The MMC3 has 4 pairs of registers at $8000-$9FFF, $A000-$BFFF, $C000-$DFFF, and $E000-$FFFF - even
   * addresses ($8000, $8002, etc.) select the low register and odd addresses ($8001, $8003, etc.) select the
   * high register in each pair. These can be broken into two independent functional units: memory mapping
   * ($8000, $8001, $A000, $A001) and scanline counting ($C000, $C001, $E000, $E001).
   *
   * Bank select ($8000-$9FFE, even)
   * 7  bit  0
   * ---- ----
   * CPMx xRRR
   * |||   |||
   * |||   +++- Specify which bank register to update on next write to Bank Data register
   * |||          000: R0: Select 2 KB CHR bank at PPU $0000-$07FF (or $1000-$17FF)
   * |||          001: R1: Select 2 KB CHR bank at PPU $0800-$0FFF (or $1800-$1FFF)
   * |||          010: R2: Select 1 KB CHR bank at PPU $1000-$13FF (or $0000-$03FF)
   * |||          011: R3: Select 1 KB CHR bank at PPU $1400-$17FF (or $0400-$07FF)
   * |||          100: R4: Select 1 KB CHR bank at PPU $1800-$1BFF (or $0800-$0BFF)
   * |||          101: R5: Select 1 KB CHR bank at PPU $1C00-$1FFF (or $0C00-$0FFF)
   * |||          110: R6: Select 8 KB PRG ROM bank at $8000-$9FFF (or $C000-$DFFF)
   * |||          111: R7: Select 8 KB PRG ROM bank at $A000-$BFFF
   * ||+------- Nothing on the MMC3, see MMC6
   * |+-------- PRG ROM bank mode (0: $8000-$9FFF swappable,
   * |                                $C000-$DFFF fixed to second-last bank;
   * |                             1: $C000-$DFFF swappable,
   * |                                $8000-$9FFF fixed to second-last bank)
   * +--------- CHR A12 inversion (0: two 2 KB banks at $0000-$0FFF, four 1 KB banks at $1000-$1FFF;
   *                               1: two 2 KB banks at $1000-$1FFF, four 1 KB banks at $0000-$0FFF)
   *
   */
  mapWriteByCPU(address, data) {
    const isEven = address % 2 === 0;

    if (address >= 0x8000 && address <= 0x9FFF) {
      if (isEven) {
        this.targetBankRegister = data & 0x07;
        this.programBankMode = data & 0x40;
        this.characterInversion = data & 0x80;

        /**
         * Bank data ($8001-$9FFF, odd)
         * 7  bit  0
         * ---- ----
         * DDDD DDDD
         * |||| ||||
         * ++++-++++- New bank value, based on last value written to Bank select register
         */
      } else {
        this.bankRegister.setData(this.targetBankRegister, data);
        this.updateCharacterBanks();
        this.updateProgramBanks();
      }
    }

    if (address >= 0xA000 && address <= 0xBFFF) {
      if (isEven) {
        if (data & 0x01) {
          this.mirrorMode = Mirror.HORIZONTAL;
        } else {
          this.mirrorMode = Mirror.VERTICAL;
        }
      }
    }

    /**
     * This latch specifies the IRQ counter reload value. When the IRQ counter is zero (or a reload is requested
     * through $C001), this value will be copied to the IRQ counter at the NEXT rising edge of the PPU address,
     * presumably at PPU cycle 260 of the current scanline.
     */
    if (address >= 0xC000 && address <= 0xDFFF) {
      if (isEven) {
        this.irqLatch[0] = data;
      } else {
        this.irqCounter[0] = 0x0000;    // Writing any value to this register clears the MMC3 IRQ counter immediately
      }
    }

    if (address >= 0xE000 && address <= 0xFFFF) {
      if (isEven) {
        this.irqEnabled = false;
        this.irqActive = false;
      } else {
        this.irqEnabled = true;
      }
    }
  }

  mapReadByPPU(address) {
    address = this.characterInversion ? address ^ 0x1000 : address;   // Switches character banks depending on character inversion
    if (address <= 0x03FF) {
      return this.characterBank[0] + (address & 0x03FF);
    }

    if (address <= 0x07FF) {
      return this.characterBank[1] + (address & 0x03FF);
    }

    if (address <= 0x0BFF) {
      return this.characterBank[2] + (address & 0x03FF);
    }

    if (address <= 0x0FFF) {
      return this.characterBank[3] + (address & 0x03FF);
    }

    if (address <= 0x13FF) {
      return this.characterBank[4] + (address & 0x03FF);
    }

    if (address <= 0x17FF) {
      return this.characterBank[5] + (address & 0x03FF);
    }

    if (address <= 0x1BFF) {
      return this.characterBank[6] + (address & 0x03FF);
    }

    if (address <= 0x1FFF) {
      return this.characterBank[7] + (address & 0x03FF);
    }
  }

  irqState() {
    return this.irqActive;
  }

  irqClear() {
    this.irqActive = false;
  }

  scanLine() {
    if (this.irqCounter[0] === 0) {
      this.irqCounter[0] = this.irqLatch[0];
    } else {
      this.irqCounter[0]--;
    }

    if (this.irqCounter[0] === 0 && this.irqEnabled) {
      this.irqActive = true;
    }
  }

  /**
   *
   * CHR map mode →	$8000.D7 = 0	$8000.D7 = 1
   * PPU Bank	Value of MMC3 register
   * $0000-$03FF	    R0	          R2
   * $0400-$07FF	                  R3
   * $0800-$0BFF	    R1	          R4
   * $0C00-$0FFF	                  R5
   * $1000-$13FF	    R2	          R0
   * $1400-$17FF	    R3
   * $1800-$1BFF	    R4	          R1
   * $1C00-$1FFF	    R5
   *
   * 2KB banks may only select even numbered CHR banks. (The lowest bit is ignored.)
   */
  updateCharacterBanks() {
      this.characterBank[0] = this.bankRegister.getRegisterData(0) * this.ONE_KILOBYTE_BANK;
      this.characterBank[1] = this.bankRegister.getRegisterData(0) * this.ONE_KILOBYTE_BANK + this.ONE_KILOBYTE_BANK;
      this.characterBank[2] = this.bankRegister.getRegisterData(1) * this.ONE_KILOBYTE_BANK;
      this.characterBank[3] = this.bankRegister.getRegisterData(1) * this.ONE_KILOBYTE_BANK + this.ONE_KILOBYTE_BANK;
      this.characterBank[4] = this.bankRegister.getRegisterData(2) * this.ONE_KILOBYTE_BANK;
      this.characterBank[5] = this.bankRegister.getRegisterData(3) * this.ONE_KILOBYTE_BANK;
      this.characterBank[6] = this.bankRegister.getRegisterData(4) * this.ONE_KILOBYTE_BANK;
      this.characterBank[7] = this.bankRegister.getRegisterData(5) * this.ONE_KILOBYTE_BANK;
  }

  /**
   * Bit 6 of the last value written to $8000 swaps the PRG windows at $8000 and $C000. The MMC3 uses one map if
   * bit 6 was cleared to 0 (value & $40 == $00) and another if set to 1 (value & $40 == $40).
   *
   * PRG map mode →	$8000.D6 = 0	$8000.D6 = 1
   * CPU Bank	Value of MMC3 register
   * $8000-$9FFF	      R6	          (-2)
   * $A000-$BFFF	      R7	          R7
   * $C000-$DFFF	      (-2)	        R6
   * $E000-$FFFF	      (-1)	        (-1)
   *
   * (-1) : the last bank
   * (-2) : the second last bank
   *
   * Because the values in R6, R7, and $8000 are unspecified at power on, the reset vector must point into $E000-$FFFF,
   * and code must initialize these before jumping out of $E000-$FFFF.
   */
  updateProgramBanks() {
    if (this.programBankMode) {
      this.programBank[0] = (this.programBanks * 2 - 2);
      this.programBank[2] = this.bankRegister.getRegisterData(6);
    } else {
      this.programBank[0] = this.bankRegister.getRegisterData(6);
      this.programBank[2] = (this.programBanks * 2 - 2);
    }

    this.programBank[1] = this.bankRegister.getRegisterData(7);
  }

  mirror() {
    return this.mirrorMode;
  }

  reset() {
    this.targetBankRegister = 0x00;
    this.programBankMode = false;
    this.characterInversion = false;
    this.mirrorMode = Mirror.HORIZONTAL;

    this.programBank[3] = (this.programBanks * 2 - 1);    // Fixed to the last bank, never changes
    this.bankRegister.reset();
    this.bankRegister.setNumberOfProgramBanks(this.programBanks);
    this.updateProgramBanks();
    this.updateCharacterBanks();

    this.irqActive = false;
    this.irqEnabled = false;
    this.irqCounter[0] = 0x0000;
    this.irqLatch[0] = 0x0000;
  }
}
