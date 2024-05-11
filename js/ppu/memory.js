export class MemoryArea {
  memory;

  constructor(size = 32) {
    this.memory = new Uint8Array(size);
  }

  read(location) {
    return this.memory[location];
  }

  write(location, data) {
    this.memory[location] = data;
  }
}
