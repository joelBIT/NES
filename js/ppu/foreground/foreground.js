import { Shifter } from "./shifter.js";
import { OAM } from "./oam.js";
import { Pixel, Type } from "../pixel.js";

/**
 * The foreground consists of sprites. The NES supports 64 8x8 pixel sprites or 64 8x16 pixel sprites.
 */
export class Foreground {
  shifter = new Shifter();
  spriteDataLow = new Uint8Array(1);        // Stores data for a sprite
  spriteDataHigh = new Uint8Array(1);       // Stores data for a sprite
  spriteAddressLow = new Uint16Array(1);    // Location in character memory where to read sprite patterns from
  spriteAddressHigh = new Uint16Array(1);   // Location in character memory where to read sprite patterns from
  spriteZeroHitPossible = false;
  spriteZeroBeingRendered = false;
  OAM = new OAM();        // Contains approximately 64 sprites (256 bytes), where each sprite's information occupies 4 bytes
  SPRITE_BYTES = 4;

  setPatternLow(index, data) {
    this.shifter.setPatternLow(index, data);
  }

  setPatternHigh(index, data) {
    this.shifter.setPatternHigh(index, data);
  }

  shift(index) {
    this.shifter.shift(index);
  }

  getSpriteAddressLow() {
    return this.spriteAddressLow[0];
  }

  setSpriteAddressLow(address) {
    this.spriteAddressLow[0] = address;
  }

  getSpriteAddressHigh() {
    return this.spriteAddressHigh[0];
  }

  setSpriteAddressHigh(address) {
    this.spriteAddressHigh[0] = address;
  }

  getSpriteDataLow() {
    return this.spriteDataLow[0];
  }

  setSpriteDataLow(data) {
    this.spriteDataLow[0] = data;
  }

  getSpriteDataHigh() {
    return this.spriteDataHigh[0];
  }

  setSpriteDataHigh(data) {
    this.spriteDataHigh[0] = data;
  }

  setSpriteZeroHitPossible(value) {
    this.spriteZeroHitPossible = value;
  }

  isSpriteZeroHitPossible() {
    return this.spriteZeroHitPossible;
  }

  isSpriteZeroBeingRendered() {
    return this.spriteZeroBeingRendered;
  }

  /**
   *  Reverses the bits of an 8-bit value.
   */
  reverseBits(value) {
    value = (value & 0xF0) >> 4 | (value & 0x0F) << 4;
    value = (value & 0xCC) >> 2 | (value & 0x33) << 2;
    value = (value & 0xAA) >> 1 | (value & 0x55) << 1;

    return value;
  }

  /**
   * Flip Patterns Horizontally.
   */
  flipSpriteDataBits() {
    this.spriteDataHigh[0] = this.reverseBits(this.spriteDataHigh[0]);
    this.spriteDataLow[0] = this.reverseBits(this.spriteDataLow[0]);
  }

  spriteEvaluation(scanline, spriteSize) {
    return this.OAM.spriteEvaluation(scanline, spriteSize);
  }

  writeOAM(address, data) {
    address === undefined ? this.OAM.writeData(this.OAM.getAddress(), data) : this.OAM.writeData(address, data);
  }

  writeAddressOAM(address) {
    this.OAM.setAddress(address);
  }

  getOAM() {
    return this.OAM.getData(this.OAM.getAddress());
  }

  spriteShift() {
    for (let i = 0, sprite = 0; i < this.OAM.getSpriteCount(); i++, sprite += this.SPRITE_BYTES) {
      if (this.OAM.getCoordinateX(sprite) > 0) {
        this.OAM.decrementCoordinateX(sprite);
      } else {
        this.shift(i);
      }
    }
  }

  initializeForegroundRendering() {
    this.OAM.fillSecondaryOAM(0xFF);
    this.OAM.clearSpriteCount();
  }

  getSpriteCount() {
    return this.OAM.getSpriteCount();
  }

  getTileCellAndRow8by8(sprite, scanline) {
    return this.OAM.getTileCellAndRow8by8(sprite, scanline);
  }

  getHalfTileCellAndRow8by16(sprite, scanline) {
    return this.OAM.getHalfTileCellAndRow8by16(sprite, scanline);
  }

  isFlippedHorizontally(sprite) {
    return this.OAM.isFlippedHorizontally(sprite);
  }

  getCoordinateX(sprite) {
    return this.OAM.getCoordinateX(sprite);
  }

  /**
   * Check if any pixel has 0 as an X coordinate (means it should be rendered). The pixels are in priority order so the
   * first occurrence of a pixel with X coordinate 0 is the one that should be rendered (given that the pixel is not
   * transparent). The rest of the pixels are skipped and this method returns.
   *
   * @returns {Pixel}     the pixel to be rendered. An empty pixel if none is to be rendered.
   */
  getPixel() {
    let pixel = new Pixel(0x00, Type.FOREGROUND, 0x00);
    this.spriteZeroBeingRendered = false;
    for (let i = 0, sprite = 0; i < this.getSpriteCount(); i++, sprite += this.SPRITE_BYTES) {
      if (this.getCoordinateX(sprite) === 0) {
        pixel.setWord(this.shifter.getPixel(i));
        pixel.setPalette(this.OAM.getSpritePalette(sprite));
        pixel.setPriority(this.OAM.getSpritePriority(sprite));

        if (pixel.getWord() !== 0) {    // If pixel is not transparent, it is rendered and rest is skipped because highest priority pixel comes before others
          if (i === 0) {
            this.spriteZeroBeingRendered = true;
          }
          break;
        }
      }
    }
    return pixel;
  }

  reset() {
    this.shifter.reset();
    this.clearSpriteData();
    this.OAM.reset();
  }

  clearShifters() {
    this.shifter.reset();
  }

  clearSpriteData() {
    this.spriteDataLow[0] = 0x00;
    this.spriteDataHigh[0] = 0x00;
    this.spriteAddressLow[0] = 0x0000;
    this.spriteAddressHigh[0] = 0x0000;
  }
}
