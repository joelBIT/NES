import { MapperZero } from "./mapper.js";

/**
 *  Mirror
 */
const Mirror = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  HARDWARE: "hardware",
  ONE_SCREEN_LOW: "one screen_low",
  ONE_SCREEN_HIGH: "one screen_high"
});

/**
 * A Cartridge contains game code and data, i.e., Program Rom, Mapper and an 8-kilobyte Pattern table.
 * Pattern memory is also known as Character memory. A Cartridge is connected to both buses.
 */
export class Cartridge {
  header;
  imageValid = false;

  programMemory = [];
  characterMemory = [];
  mapper;

  mapperID = 0;
  programBanks = 0;                   // Single bank of program memory is 16 kB
  characterBanks = 0;                 // Single bank of character memory is 8 kB
  mirror = Mirror.HORIZONTAL;

  constructor(cartridge) {
    this.header = new FormatHeader(cartridge.subarray(0, 16));
    let index = 16;

    if (this.header.getMapper1() & 0x04) {
      index += 512;   // If a "trainer" exists we read past it
    }

    this.mapperID = ((this.header.getMapper2() >> 4) << 4) | (this.header.getMapper1() >> 4);
    this.mirror = (this.header.getMapper1() & 0x01) ? Mirror.VERTICAL : Mirror.HORIZONTAL;

    const fileType = 1;       // 3 types of iNES file     (0, 1, and 2)

    if (fileType === 0) {

    }

    if (fileType === 1) {
      this.programBanks = this.header.getProgramChunks();
      const programMemoryLength = this.header.getProgramChunks() * 16384;
      this.programMemory = cartridge.subarray(index, index + programMemoryLength);
      index += programMemoryLength;

      this.characterBanks = this.header.getCharacterChunks();

      let characterMemoryLength = 8192;
      if (this.characterBanks > 1) {
        characterMemoryLength = this.characterBanks * 8192;
      }
      this.characterMemory = cartridge.subarray(index, index + characterMemoryLength);
    }

    if (fileType === 2) {

    }

    switch (this.mapperID) {
      case 0:
        this.mapper = new MapperZero(this.programBanks, this.characterBanks);
        break;
      case 2:
        break;
      case 3:
        break;
      case 66:
        break;
    }

    this.imageValid = true;
  }

  cpuReadCart(address) {
    const mapped = this.mapper.mapReadCPU(address);
    if (mapped) {
      if (mapped.address === 0xFFFFFFFF) {
        return true;
      }
      return { "data": this.programMemory[mapped.address] };
    }
    return false;
  }

  cpuWriteCart(address, data) {
    const mapped = this.mapper.mapWriteCPU(address);
    if (mapped) {
      if (mapped.address === 0xFFFFFFFF) {
        return true;
      }
      this.programMemory[mapped.address] = data;
      return true;
    }
    return false;
  }

  ppuReadCart(address) {
    const mapped = this.mapper.mapReadPPU(address);
    if (mapped) {
      return { "data": this.characterMemory[mapped.address] };
    }
    return false;
  }

  ppuWriteCart(address, data) {
    const mapped = this.mapper.mapWritePPU(address);
    if (mapped) {
      this.characterMemory[mapped.address] = data;
      return true;
    }
    return false;
  }

  reset() {
    if (this.mapper) {
      this.mapper.reset();
    }
  }

  getMirror() {
    if (Object.is(Mirror.HARDWARE, this.mapper.mirror())) {
      return this.mirror;
    }
    return this.mapper.mirror();
  }

  getMapper() {
    return this.mapper;
  }
}

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
class FormatHeader {
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
