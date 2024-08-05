
/**
 *  Some cartridges have a CHR ROM, which holds a fixed set of graphics tile data available to the PPU from the moment
 *  it turns on. Other cartridges have a CHR RAM that holds data that the CPU has copied from PRG ROM through a port on
 *  the PPU (A few have both CHR ROM and CHR RAM). Some mappers are designed for CHR RAM; they let the CPU switch to a
 *  PRG ROM bank containing CHR data and copy it to CHR RAM.
 */
export class CharacterRAM {
  data = new Uint8Array(0x2000);

  read(address) {
    return this.data[address & 0x1FFF];
  }

  write(address, data) {
    this.data[address & 0x1FFF] = data;
  }
}
