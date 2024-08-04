/**
 * Represents the Character memory or Program memory of a cartridge. Each of these memories consists of a number of
 * memory banks, which are segments of the memory. A single bank of Character memory is 8kB and a single bank of program
 * memory is 16 kB. This means that 128kB Character memory consists of 128/8 = 16 banks and 128kB Program memory
 * consists of 128/16 = 8 banks.
 */
export class Memory {
  data;

  constructor(data = []) {
    this.data = data;
  }

  read(address) {
    return this.data[address];
  }

  write(address, data) {
    this.data[address] = data;
  }
}
