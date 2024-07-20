import { Mirror } from "../mirror.js";

/**
 *  The iNES Format Header. The .nes file format is the standard for distribution of NES binary programs. An iNES file
 *  consists of several sections, and a 16-byte header is one of them. This class represents that header.
 *  The first 4 bytes (0-3) are the constants $4E $45 $53 $1A
 *  Byte 5 (4) is the size of PRG ROM in 16 KB units.
 *  Byte 6 (5) is the size of CHR ROM in 8 KB units (value 0 means the board uses CHR RAM).
 *  Byte 7 (6) corresponds to Flags 6 – Mapper, mirroring, battery, trainer.
 *  Byte 8 (7) corresponds to Flags 7 – Mapper, VS/Playchoice, NES 2.0.
 *  Byte 9 (8) is the size of PRG RAM in 8 KB units.
 *  Byte 10 (9) corresponds to TV system of choice (0: NTSC; 1: PAL).
 *  Byte 11 (10) corresponds to TV system, PRG-RAM presence.
 *  Bytes 12-16 (11-15) is unused padding.
 *
 *
 *  Byte 7:
 * 76543210
 * ||||||||
 * |||||||+- Nametable arrangement: 0: vertical arrangement ("horizontal mirrored") (CIRAM A10 = PPU A11)
 * |||||||                          1: horizontal arrangement ("vertically mirrored") (CIRAM A10 = PPU A10)
 * ||||||+-- 1: Cartridge contains battery-backed PRG RAM ($6000-7FFF) or other persistent memory
 * |||||+--- 1: 512-byte trainer at $7000-$71FF (stored before PRG data)
 * ||||+---- 1: Alternative nametable layout
 * ++++----- Lower nybble of mapper number
 *
 *
 * Byte 8:
 * 76543210
 * ||||||||
 * |||||||+- VS Unisystem
 * ||||||+-- PlayChoice-10 (8 KB of Hint Screen data stored after CHR data)
 * ||||++--- If equal to 2, flags 8-15 are in NES 2.0 format
 * ++++----- Upper nybble of mapper number
 *
 */
export class FormatHeader {
  header = new DataView(new ArrayBuffer(16));

  constructor(header) {
    for (let i = 0; i < 16; i++) {
      this.header.setUint8(i, header[i]);
    }
  }

  isINES() {
    return this.header.getUint8(0) === 0x4E && this.header.getUint8(1) === 0x45 &&
      this.header.getUint8(2) === 0x53 && this.header.getUint8(3) === 0x1A;
  }

  getProgramChunks() {
    return this.header.getUint8(4);
  }

  getCharacterChunks() {
    return this.header.getUint8(5);
  }

  getMirrorMode() {
    return (this.header.getUint8(6) & 0x01) ? Mirror.VERTICAL : Mirror.HORIZONTAL;
  }

  hasTrainer() {
    return this.header.getUint8(6) & 0x04;
  }

  isINES2() {
    return this.header.getUint8(7) & 0x0C === 0x08;
  }

  getMapperID() {
    return ((this.header.getUint8(7) >> 4) << 4) | (this.header.getUint8(6) >> 4);
  }

  getProgramRamSize() {
    return this.header.getUint8(8);
  }
}
