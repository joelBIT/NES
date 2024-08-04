import { Mirror } from "../mirror.js";
import { FormatHeader } from "./header.js";
import { MapperZero } from "./mappers/mapper0.js";
import { MapperOne } from "./mappers/mapper1.js";
import { MapperTwo } from "./mappers/mapper2.js";
import { MapperThree } from "./mappers/mapper3.js";
import { MapperSixtySix } from "./mappers/mapper66.js";
import { MapperFour } from "./mappers/mapper4.js";
import { MapperSeven } from "./mappers/mapper7.js";
import { CharacterROM } from "./characterROM.js";
import { ProgramROM } from "./programROM.js";
import { ProgramRAM } from "./ProgramRAM.js";

/**
 * A Cartridge contains game code and data, i.e., Program Rom, Mapper and an 8-kilobyte Pattern table. An NES cartridge
 * has at least two memory chips on it: PRG (connected to the CPU) and CHR (connected to the PPU). There is always at
 * least one PRG ROM, and there may be an additional PRG RAM to hold data. A Cartridge is connected to both buses (CPU
 * bus and PPU bus), though, only one Bus is used for both the CPU and PPU in this emulator.
 *
 */
export class Cartridge {
  header;
  EIGHT_KILOBYTES = 8192;
  SIXTEEN_KILOBYTES = 16384;
  HEADER_BYTES = 16;
  TRAINER_BYTES = 512;

  programROM;
  characterROM;
  programRAM = new ProgramRAM();
  mapper;

  mirror = Mirror.HORIZONTAL;

  constructor(cartridge) {
    this.header = new FormatHeader(cartridge.subarray(0, this.HEADER_BYTES));
    if (!this.header.isINES()) {
      throw 'Not an iNES Rom';
    }
    let index = this.HEADER_BYTES;

    if (this.header.hasTrainer()) {
      index += this.TRAINER_BYTES;   // If a "trainer" exists we read past it
    }

    this.mirror = this.header.getMirrorMode();

    this.programBanks = this.header.getProgramChunks();
    const programMemoryLength = this.programBanks * this.SIXTEEN_KILOBYTES;
    this.programROM = new ProgramROM(cartridge.subarray(index, index + programMemoryLength));
    index += programMemoryLength;

    this.characterBanks = this.header.getCharacterChunks();
    if (this.characterBanks !== 0) {
      const characterMemoryLength = this.characterBanks * this.EIGHT_KILOBYTES;
      this.characterROM = new CharacterROM(cartridge.subarray(index, index + characterMemoryLength));
    } else {
      this.characterROM = new CharacterROM();
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
    if (address >= 0x6000 && address <= 0x7FFF) {
      return { "data": this.programRAM.read(address) };
    }

    const mapped = this.mapper.mapReadByCPU(address);
    if (mapped) {
      return { "data": this.programROM.read(mapped.address) };
    }
    return false;
  }

  /**
   *
   *
   * @param address         the address to be mapped, if possible
   * @param data            data to be written, or used to switch banks and other settings
   * @returns {boolean}     true if the write request was handled, false otherwise
   */
  writeByCPU(address, data) {
    if (address >= 0x6000 && address <= 0x7FFF) {
      this.programRAM.write(address, data);
      return true;
    }

    const mapped = this.mapper.mapWriteByCPU(address, data);
    if (mapped) {
      this.programROM.write(mapped.address, data);
      return true;
    }
    return false;
  }

  readByPPU(address) {
    const mapped = this.mapper.mapReadByPPU(address);
    if (mapped) {
      return { "data": this.characterROM.read(mapped.address) };
    }
    return false;
  }

  writeByPPU(address, data) {
    const mapped = this.mapper.mapWriteByPPU(address);
    if (mapped) {
      if (mapped.address) {
        this.characterROM.write(mapped.address, data);
      }
      return true;
    }
    return false;
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

  reset() {
    if (this.mapper) {
      this.mapper.reset();
    }
  }
}
