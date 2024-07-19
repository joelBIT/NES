import { Tile } from "./tile.js";
import { Shifter } from "./shifter.js";
import { Pixel, Type } from "../pixel.js";

/**
 * Represents the background to be rendered. It consists of shifters and tiles. The PPU outputs a picture region of
 * 256x240 pixels. The picture region is generated by doing memory fetches that fill shift registers, from which a
 * pixel is selected. It is composed of a background region filling the entire screen and smaller sprites that may be
 * placed nearly anywhere on it.
 */
export class Background {
  nextTile = new Tile();
  shifter = new Shifter();
  fineX = 0x00;     // offset (0 - 7) into a single tile (which is 8x8 pixels) to make the scrolling smooth
  MSB = 0x8000;

  getTileID() {
    return this.nextTile.getID();
  }

  setTileID(id) {
    this.nextTile.setID(id);
  }

  setTileLSB(lsb) {
    this.nextTile.setLSB(lsb);
  }

  setTileMSB(msb) {
    this.nextTile.setMSB(msb);
  }

  setTileAttribute(attribute) {
    this.nextTile.setAttribute(attribute);
  }

  getTileCell() {
    return this.getTileID() << 4; // Tile ID * 16 (16 bytes per tile)
  }

  setFineX(fineX) {
    this.fineX = fineX;
  }

  /**
   * Load the next background tile (8 pixels on scanline) pattern and attributes.
   */
  loadShifter() {
    this.shifter.setPatternLow((this.shifter.getPatternLow() & 0xFF00) | this.nextTile.getLSB());
    this.shifter.setPatternHigh((this.shifter.getPatternHigh() & 0xFF00) | this.nextTile.getMSB());

    this.shifter.setAttributeLow((this.shifter.getAttributeLow() & 0xFF00) | ((this.nextTile.getAttribute() & 0b01) > 0 ? 0xFF : 0x00));
    this.shifter.setAttributeHigh((this.shifter.getAttributeHigh() & 0xFF00) | ((this.nextTile.getAttribute() & 0b10) > 0 ? 0xFF : 0x00));
  }

  shift() {
    this.shifter.shift();
  }

  getPixel() {
    return new Pixel(this.shifter.getPixel(this.MSB >> this.fineX), Type.BACKGROUND, this.shifter.getPalette(this.MSB >> this.fineX));
  }

  reset() {
    this.nextTile.reset();
    this.shifter.reset();
    this.fineX = 0x00;
  }
}
