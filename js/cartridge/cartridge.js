import { Mirror } from "../mirror.js";
import { FormatHeader } from "./header.js";
import { MapperZero } from "../mappers/mapper0.js";
import { MapperOne } from "../mappers/mapper1.js";
import { MapperTwo } from "../mappers/mapper2.js";
import { MapperThree } from "../mappers/mapper3.js";
import { MapperSixtySix } from "../mappers/mapper66.js";
import { MapperFour } from "../mappers/mapper4.js";
import { MapperSeven } from "../mappers/mapper7.js";

/**
 * A Cartridge contains game code and data, i.e., Program Rom, Mapper and an 8-kilobyte Pattern table. An NES cartridge
 * has at least two memory chips on it: PRG (connected to the CPU) and CHR (connected to the PPU). There is always at
 * least one PRG ROM, and there may be an additional PRG RAM to hold data. A Cartridge is connected to both buses (CPU
 * bus and PPU bus), though, only one Bus is used for both the CPU and PPU in this emulator.
 *
 */
export class Cartridge {
  header;

  programMemory = [];
  characterMemory = [];
  mapper;

  programBanks = 0;                   // Single bank of program memory is 16 kB
  characterBanks = 0;                 // Single bank of character memory is 8 kB
  mirror = Mirror.HORIZONTAL;

  constructor(cartridge) {
    this.header = new FormatHeader(cartridge.subarray(0, 16));
    if (!this.header.isINES()) {
      throw 'Not an iNES Rom';
    }
    let index = 16;

    if (this.header.hasTrainer()) {
      index += 512;   // If a "trainer" exists we read past it
    }

    this.mirror = this.header.getMirrorMode();
    const fileType = this.header.isINES2() ? 2 : 1;

    if (fileType === 1) {
      this.programBanks = this.header.getProgramChunks();
      const programMemoryLength = this.header.getProgramChunks() * 16384;
      this.programMemory = cartridge.subarray(index, index + programMemoryLength);
      index += programMemoryLength;

      this.characterBanks = this.header.getCharacterChunks();
      if (this.characterBanks !== 0) {
        const characterMemoryLength = this.characterBanks * 8192;
        this.characterMemory = cartridge.subarray(index, index + characterMemoryLength);
      }
    }

    if (fileType === 2) {
      this.programBanks = ((this.header.getProgramRamSize() & 0x07) << 8) | this.header.getProgramChunks();
      const programMemoryLength = this.programBanks * 16384;
      this.programMemory = cartridge.subarray(index, index + programMemoryLength);
      index += programMemoryLength;

      this.characterBanks = ((this.header.getProgramRamSize() & 0x38) << 8) | this.header.getCharacterChunks();
      if (this.characterBanks !== 0) {
        const characterMemoryLength = this.characterBanks * 8192;
        this.characterMemory = cartridge.subarray(index, index + characterMemoryLength);
      }
    }

    switch (this.header.getMapperID()) {
      case 0:
        this.mapper = new MapperZero(this.programBanks, this.characterBanks);
        break;
      case 1:
        this.mapper = new MapperOne(this.programBanks, this.characterBanks);
        break;
      case 2:
        this.mapper = new MapperTwo(this.programBanks, this.characterBanks);
        break;
      case 3:
        this.mapper = new MapperThree(this.programBanks, this.characterBanks);
        break;
      case 4:
      case 68:    // This is to deal with that Shadowgate is mapper 4 while the Shadowgate ROMS indicate mapper 68
        this.mapper = new MapperFour(this.programBanks, this.characterBanks);
        break;
      case 7:
        this.mapper = new MapperSeven(this.programBanks, this.characterBanks);
        break;
      case 66:
        this.mapper = new MapperSixtySix(this.programBanks, this.characterBanks);
        break;
    }
  }

  readByCPU(address) {
    const mapped = this.mapper.mapReadByCPU(address);
    if (mapped) {
      if (mapped.address === 0xFFFFFFFF) {
        return { "data": mapped.data };
      }
      return { "data": this.programMemory[mapped.address] };
    }
    return false;
  }

  writeByCPU(address, data) {
    const mapped = this.mapper.mapWriteByCPU(address, data);
    if (mapped) {
      if (mapped.address === 0xFFFFFFFF) {
        return true;
      }
      this.programMemory[mapped.address] = data;
      return true;
    }
    return false;
  }

  readByPPU(address) {
    const mapped = this.mapper.mapReadByPPU(address);
    if (mapped) {
      return { "data": this.characterMemory[mapped.address] };
    }
    return false;
  }

  writeByPPU(address, data) {
    const mapped = this.mapper.mapWriteByPPU(address);
    if (mapped) {
      if (mapped.address) {
        this.characterMemory[mapped.address] = data;
      }
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

  irqState() {
    return this.mapper.irqState();
  }

  clearIRQ() {
    this.mapper.irqClear();
  }
}
