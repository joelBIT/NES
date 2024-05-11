import { Mirror } from "../mirror.js";

/**
 * A Mapper takes the incoming addresses from both buses and transform them to the correct memory location on
 * the Cartridge. Thus, the CPU is oblivious to the data it is reading and writing. The same goes for the PPU.
 * There are many different variants of Mappers. Note that the purpose of a Mapper is not to provide any data,
 * it only translates addresses.
 */
export class Mapper {
  programBanks;
  characterBanks;

  constructor(programBanks, characterBanks) {
    this.programBanks = programBanks;
    this.characterBanks = characterBanks;
  }

  mapReadCPU(address) {
    return false;
  }

  mapWriteCPU(address) {
    return false;
  }

  mapReadPPU(address) {
    return false;
  }

  mapWritePPU(address) {
    return false;
  }

  reset() {

  }

  mirror() {
    return Mirror.HARDWARE;
  }
}
