import { Mirror } from "../mirror.js";

/**
 * A Mapper takes the incoming addresses from both buses and transform them to the correct memory location on
 * the Cartridge. Thus, the CPU is oblivious to the data it is reading and writing. The same goes for the PPU.
 *
 * NES games come in cartridges, and inside of those cartridges are various circuits and hardware. Different games use
 * different circuits and hardware, and the configuration and capabilities of such cartridges is commonly called
 * their mapper. Mappers are designed to extend the system and bypass its limitations, such as by adding RAM to the
 * cartridge or even extra sound channels.
 */
export class Mapper {
  programBanks;
  characterBanks;

  constructor(programBanks, characterBanks) {
    this.programBanks = programBanks;
    this.characterBanks = characterBanks;
  }

  mapReadByCPU(address) {
    return false;
  }

  mapWriteByCPU(address) {
    return false;
  }

  mapReadByPPU(address) {
    return false;
  }

  mapWriteByPPU(address) {
    return false;
  }

  reset() {

  }

  scanLine() {

  }

  irqState() {
    return false;
  }

  mirror() {
    return Mirror.HARDWARE;
  }
}
