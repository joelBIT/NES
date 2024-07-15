
export class Tile {
  id = new Uint8Array(1);
  attribute = new Uint8Array(1);
  lsb = new Uint8Array(1);
  msb = new Uint8Array(1);

  getID() {
    return this.id[0];
  }

  setID(id) {
    this.id[0] = id;
  }

  getAttribute() {
    return this.attribute[0];
  }

  setAttribute(attribute) {
    this.attribute[0] = attribute;
  }

  getLSB() {
    return this.lsb[0];
  }

  setLSB(lsb) {
    this.lsb[0] = lsb;
  }

  getMSB() {
    return this.msb[0];
  }

  setMSB(msb) {
    this.msb[0] = msb;
  }

  reset() {
    this.id[0] = 0x00;
    this.attribute[0] = 0x00;
    this.lsb[0] = 0x00;
    this.msb[0] = 0x00;
  }
}
