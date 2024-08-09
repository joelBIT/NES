import { Mirror } from "../../mirror.js";

/**
 * A Mapper takes the incoming addresses from both buses and transform them to the correct memory location on
 * the Cartridge. Thus, the CPU is oblivious to the data it is reading and writing. The same goes for the PPU.
 *
 * NES games come in cartridges, and inside of those cartridges are various circuits and hardware. Different games use
 * different circuits and hardware, and the configuration and capabilities of such cartridges is commonly called
 * their mapper. Mappers are designed to extend the system and bypass its limitations, such as by adding RAM to the
 * cartridge or even extra sound channels.
 *
 * The programBanks and characterBanks variables contains the number of chunks (each program chunk corresponds to 16kb
 * of data, and each character chunk corresponds to 8kb of data) a loaded game consists of.
 *
 * The program memory is an array containing program data and the character memory is an array containing character data.
 * This data can be logically divided into 'banks', which are logical segments of the array. By using the constants in
 * this class the program data and the character data can be divided into segments of desired sizes without affecting the
 * original array.
 */
export class Mapper {
  programBanks;
  characterBanks;
  ONE_KILOBYTE_BANK = 0x400;
  FOUR_KILOBYTES_BANK = 0x1000;
  EIGHT_KILOBYTES_BANK = 0x2000;
  SIXTEEN_KILOBYTES_BANK = 0x4000;
  THIRTY_TWO_KILOBYTES_BANK = 0x8000;

  constructor(programBanks, characterBanks) {
    this.programBanks = programBanks;
    this.characterBanks = characterBanks;
  }

  /**
   * Maps a read operation made by the CPU. The address that the CPU wants to read from is mapped to the corresponding
   * address on the cartridge.
   *
   * @param address - the address to be mapped
   * @returns {number} the mapped address
   */
  mapReadByCPU(address) {
    return 0x00;
  }

  /**
   * Maps a write operation made by the CPU. The address that the CPU wants to write to is mapped to the corresponding
   * address on the cartridge.
   *
   * @param address - the address to be mapped
   * @param data    - data written to RAM, or used for bank selection or other settings
   */
  mapWriteByCPU(address, data) {

  }

  /**
   * Maps a read operation made by the PPU. The address that the PPU wants to read from is mapped to the corresponding
   * address on the cartridge.
   *
   * @param address -     the address to be mapped
   * @returns {number}    the mapped address
   */
  mapReadByPPU(address) {
    return 0x00;
  }

  hasCharacterBanks() {
    return this.characterBanks > 0;
  }

  reset() {

  }

  scanLine() {

  }

  /**
   * @returns {boolean} returns true if mapper has a CPU cycle counter, false otherwise
   */
  hasCycleCounter() {
    return false;
  }

  /**
   * Invokes a CPU cycle counter. Some mappers use this to invoke an IRQ when the counter is decremented to 0 or below.
   */
  tickCycleCounter() {

  }

  irqState() {
    return false;
  }

  /**
   * Sometimes a mapper does something in the address space 0x6000 - 0x7FFF. Then this method can be used to inform
   * the cartridge that the read/write within the range 0x6000 - 0x7FFF should be done in the mapper, instead of
   * reading/writing to the cartridge program RAM.
   *
   * @returns {boolean} true if the mapper handles address space 0x6000 - 0x7FFF itself, false otherwise
   */
  handlesProgramRAM() {
    return false;
  }

  mirror() {
    return Mirror.HARDWARE;
  }
}
