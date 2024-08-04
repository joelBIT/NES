
/**
 * The optional PRG RAM chip on some cartridge boards is an 8192 byte SRAM that provides 32 pages at $6000-$7FFF.
 */
export class ProgramRAM {
  data = new Uint8Array(0x2000);

  read(address) {
    return this.data[address & 0x1FFF];
  }

  write(address, data) {
    this.data[address & 0x1FFF] = data;
  }
}
