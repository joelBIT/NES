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

  /**
   * Maps a read operation made by the CPU. The address that the CPU wants to read from is mapped to the corresponding
   * address on the cartridge.
   *
   * @param address - the address to be mapped
   * @returns the mapped address
   */
  mapReadByCPU(address) {
    return false;
  }

  /**
   * Maps a write operation made by the CPU. The address that the CPU wants to write to is mapped to the corresponding
   * address on the cartridge.
   *
   * @param address - the address to be mapped
   * @returns the mapped address
   */
  mapWriteByCPU(address) {
    return false;
  }

  /**
   * Maps a read operation made by the PPU. The address that the PPU wants to read from is mapped to the corresponding
   * address on the cartridge.
   *
   * @param address - the address to be mapped
   * @returns the mapped address
   */
  mapReadByPPU(address) {
    return false;
  }

  /**
   * Maps a write operation made by the PPU. The address that the PPU wants to write to is mapped to the corresponding
   * address on the cartridge.
   *
   * @param address - the address to be mapped
   * @returns the mapped address
   */
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
