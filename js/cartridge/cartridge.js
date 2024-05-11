import { Mirror } from "../mirror.js";
import { FormatHeader } from "./header.js";
import { MapperZero } from "../mappers/mapper0.js";

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
