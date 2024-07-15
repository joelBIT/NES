/**
 * Background tiles are always 8x8 pixels. Each nametable has two rows of cells that are not tile information, instead
 * they represent the attribute information that indicates which palettes are applied to which area on the screen.
 *
 * The information that a buffered tile consists of is stored in the variables of this class. This buffered tile is
 * supposed to be rendered for the next 8 cycles.
 */
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
