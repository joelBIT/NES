
export const Type = Object.freeze({
  FOREGROUND: "foreground",
  EMPTY: "empty",
  BACKGROUND: "background"
});

/**
 * Represents a pixel on the screen. The pixel could be in the background or in the foreground (sprite).
 * Priority 1 means a sprite is in front of the background; 0 if sprite is behind the background.
 */
export class Pixel {
  pixel = 0x00;               // A 2-bit word that represents the pixel
  palette = 0x00;
  type = Type.EMPTY;
  priority = 0;               // Priority is either 0 or 1 (highest)

  constructor(pixel, type, palette) {
    this.pixel = pixel;
    this.type = type;
    this.palette = palette;
  }

  getWord() {
    return this.pixel;
  }

  setWord(pixel) {
    this.pixel = pixel;
  }

  setPalette(palette) {
    this.palette = palette;
  }

  getPriority() {
    return this.priority;
  }

  setPriority(priority) {
    this.priority = priority;
  }

  /**
   * Compare which pixel has highest priority. A background pixel is compared with the foreground pixel argument.
   *
   * @param fgPixel           the foreground pixel
   * @returns {Pixel|*}       the pixel with highest priority, or an empty pixel if none has highest
   */
  comparePriority(fgPixel) {
    if (this.pixel === 0 && fgPixel.getWord() === 0) {
      return new Pixel(0x00, Type.EMPTY, 0x00);
    } else if (this.pixel === 0 && fgPixel.getWord() > 0) {
      return fgPixel;
    } else if (this.pixel > 0 && fgPixel.getWord() === 0) {
      return this;
    } else if (this.pixel > 0 && fgPixel.getWord() > 0) {
      if (fgPixel.getPriority()) {
        return fgPixel;
      } else {
        return this;
      }
    }
  }
}
