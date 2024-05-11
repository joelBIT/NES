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
 */
export class FormatHeader {
  header = new DataView(new ArrayBuffer(16));

  constructor(header) {
    for (let i = 0; i < 16; i++) {
      this.header.setUint8(i, header[i]);
    }
  }

  getProgramChunks() {
    return this.header.getUint8(4);
  }

  getCharacterChunks() {
    return this.header.getUint8(5);
  }

  getMapper1() {
    return this.header.getUint8(6);
  }

  getMapper2() {
    return this.header.getUint8(7);
  }
}
