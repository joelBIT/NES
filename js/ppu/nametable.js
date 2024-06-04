import { Mirror } from "../mirror.js";
import { MemoryArea } from "./memory.js";

/**
 * A nametable is a 1024 byte area of memory used by the PPU to lay out backgrounds. Each byte in the nametable controls
 * one 8x8 pixel character cell, and each nametable has 30 rows of 32 tiles each. With each tile being 8x8 pixels, this
 * makes a total of 256x240 pixels in one map, the same size as one full screen.
 *
 * The NES has four logical nametables, arranged in a 2x2 pattern. Each occupies a 1 KiB chunk of PPU address space,
 * starting at $2000 at the top left, $2400 at the top right, $2800 at the bottom left, and $2C00 at the bottom right.
 *
 * Mirroring: The NES system board itself has only 2 KiB of VRAM, enough for two physical nametables; hardware on the
 * cartridge controls address bit 10 of CIRAM to map one nametable on top of another:
 *  - Vertical mirroring: $2000 equals $2800 and $2400 equals $2C00 (e.g. Super Mario Bros.).
 *  - Horizontal mirroring: $2000 equals $2400 and $2800 equals $2C00 (e.g. Kid Icarus).
 *  - One-screen mirroring: All nametables refer to the same memory at any given time, and the mapper directly manipulates
 *    CIRAM address bit 10 (e.g. many Rare games using AxROM).
 *  - Four-screen mirroring: The cartridge contains additional VRAM used for all nametables (e.g. Gauntlet, Rad Racer 2).
 */
export class NameTableContainer {
  nameTable1 = new MemoryArea(1024);
  nameTable2 = new MemoryArea(1024);

  read(address, mirrorMode) {
    if (Object.is(Mirror.VERTICAL, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        return this.nameTable1.read(address & 0x03FF);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        return this.nameTable2.read(address & 0x03FF);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        return this.nameTable1.read(address & 0x03FF);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        return this.nameTable2.read(address & 0x03FF);
      }
    } else if (Object.is(Mirror.HORIZONTAL, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        return this.nameTable1.read(address & 0x03FF);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        return this.nameTable1.read(address & 0x03FF);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        return this.nameTable2.read(address & 0x03FF);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        return this.nameTable2.read(address & 0x03FF);
      }
    } else if (Object.is(Mirror.SINGLE_SCREEN_LOW, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        return this.nameTable1.read(address & 0x03FF);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        return this.nameTable1.read(address & 0x03FF);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        return this.nameTable1.read(address & 0x03FF);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        return this.nameTable1.read(address & 0x03FF);
      }
    } else if (Object.is(Mirror.SINGLE_SCREEN_HIGH, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        return this.nameTable2.read(address & 0x03FF);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        return this.nameTable2.read(address & 0x03FF);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        return this.nameTable2.read(address & 0x03FF);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        return this.nameTable2.read(address & 0x03FF);
      }
    }
  }

  write(address, data, mirrorMode) {
    if (Object.is(Mirror.VERTICAL, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        this.nameTable1.write(address & 0x03FF, data);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        this.nameTable2.write(address & 0x03FF, data);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        this.nameTable1.write(address & 0x03FF, data);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        this.nameTable2.write(address & 0x03FF, data);
      }
    } else if (Object.is(Mirror.HORIZONTAL, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        this.nameTable1.write(address & 0x03FF, data);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        this.nameTable1.write(address & 0x03FF, data);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        this.nameTable2.write(address & 0x03FF, data);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        this.nameTable2.write(address & 0x03FF, data);
      }
    } else if (Object.is(Mirror.SINGLE_SCREEN_LOW, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        this.nameTable1.write(address & 0x03FF, data);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        this.nameTable1.write(address & 0x03FF, data);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        this.nameTable1.write(address & 0x03FF, data);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        this.nameTable1.write(address & 0x03FF, data);
      }
    } else if (Object.is(Mirror.SINGLE_SCREEN_HIGH, mirrorMode)) {
      if (address >= 0x0000 && address <= 0x03FF) {
        this.nameTable2.write(address & 0x03FF, data);
      } else if (address >= 0x0400 && address <= 0x07FF) {
        this.nameTable2.write(address & 0x03FF, data);
      } else if (address >= 0x0800 && address <= 0x0BFF) {
        this.nameTable2.write(address & 0x03FF, data);
      } else if (address >= 0x0C00 && address <= 0x0FFF) {
        this.nameTable2.write(address & 0x03FF, data);
      }
    }
  }

  reset() {
    this.nameTable1 = new MemoryArea(1024);
    this.nameTable2 = new MemoryArea(1024);
  }
}
