/**
 * The Loopy Register used by the PPU.
 *
 * Bits 0-4: Coarse X
 * Bits 5-9: Coarse Y
 * Bit 10: Name table X
 * Bit 11: Name table Y
 * Bit 12-14: Fine Y
 * Bit 15: Unused
 */
export class LoopyRegister {
  loopy = new Uint16Array(1);

  getCoarseX() {
    return this.loopy[0] & 0x001F;
  }

  setCoarseX(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 0) : this.loopy[0] |= (1 << 0);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 1) : this.loopy[0] |= (1 << 1);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 2) : this.loopy[0] |= (1 << 2);
    (value & 0x8) === 0 ? this.loopy[0] &= ~(1 << 3) : this.loopy[0] |= (1 << 3);
    (value & 0x10) === 0 ? this.loopy[0] &= ~(1 << 4) : this.loopy[0] |= (1 << 4);
  }

  getCoarseY() {
    return (this.loopy[0] & 0x03E0) >> 5;
  }

  setCoarseY(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 5) : this.loopy[0] |= (1 << 5);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 6) : this.loopy[0] |= (1 << 6);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 7) : this.loopy[0] |= (1 << 7);
    (value & 0x8) === 0 ? this.loopy[0] &= ~(1 << 8) : this.loopy[0] |= (1 << 8);
    (value & 0x10) === 0 ? this.loopy[0] &= ~(1 << 9) : this.loopy[0] |= (1 << 9);
  }

  getNameTableX() {
    return (this.loopy[0] & 0x0400) >> 10;
  }

  setNameTableX(value) {
    value === 0 ? this.loopy[0] &= ~(1 << 10) : this.loopy[0] |= (1 << 10);
  }

  getNameTableY() {
    return (this.loopy[0] & 0x0800) >> 11;
  }

  setNameTableY(value) {
    value === 0 ? this.loopy[0] &= ~(1 << 11) : this.loopy[0] |= (1 << 11);
  }

  getFineY() {
    return (this.loopy[0] & 0x7000) >> 12;
  }

  setFineY(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 12) : this.loopy[0] |= (1 << 12);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 13) : this.loopy[0] |= (1 << 13);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 14) : this.loopy[0] |= (1 << 14);
  }

  getRegister() {
    return this.loopy[0];
  }

  setRegister(data) {
    this.loopy[0] = data;
  }
}
