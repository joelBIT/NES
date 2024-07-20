/**
 * Sprites are stored in this class (Object Attribute Memory). This storage consists of 256 bytes of sprite information.
 * The information of one Sprite requires 4 bytes. Thus, the OAM can store 64 sprites (256/4). For the most part, all
 * of the characters in the pattern memory are represented as 8x8 pixels. Since the size of the OAM is only 256 bytes,
 * it only needs one byte of addressing information. DMA is used (due to its speed) to fill the OAM with data. Two ports
 * on the PPU can address the OAM directly (OAM_ADDR and OAM_DATA).
 *
 * A Sprite consists of four 8-bit registers: Y, tileID, attributes, and X. The attributes property consists of flags
 * that define how the sprite should be rendered.
 *
 * Byte 0: Y position of top of sprite.
 *
 * Byte 1: Tile index number (For 8x8 sprites, this is the tile number of this sprite within the pattern table
 *         selected in bit 3 of PPUCTRL ($2000)).
 *
 * 76543210
 * ||||||||
 * |||||||+- Bank ($0000 or $1000) of tiles
 * +++++++-- Tile number of top of sprite (0 to 254; bottom half gets the next tile)
 *
 *
 * Byte 2: Attributes.
 *
 * 76543210
 * ||||||||
 * ||||||++- Palette (4 to 7) of sprite
 * |||+++--- Unimplemented (read 0)
 * ||+------ Priority (0: in front of background; 1: behind background)
 * |+------- Flip sprite horizontally
 * +-------- Flip sprite vertically
 *
 *
 * Byte 3: X position of left side of sprite.
 *
 */
export class OAM {
  OAM = new Uint8Array(0x100);     // Contains approximately 64 sprites (256 bytes), where each sprite's information occupies 4 bytes
  secondaryOAM = new Uint8Array(0x20);   // Stores information about up to 8 sprites
  address = new Uint8Array(1);    // Some ports may access the OAM directly on this address
  spriteCount = 0;    // How many sprites we find from the OAM that are going to be rendered on the next scanline, fill secondaryOAM with those
  ATTRIBUTES_BYTE = 2;
  SPRITE_BYTES = 4;
  OAM_BYTES = 256;
  TILE_ID_BYTE = 1;
  X_BYTE = 3;
  MAX_SPRITE_COUNT = 8;

  getData(index) {
    return this.OAM[index];
  }

  writeData(index, data) {
    this.OAM[index] = data;
  }

  decrementCoordinateX(index) {
    this.secondaryOAM[index + this.X_BYTE]--;
  }

  fillSecondaryOAM(value) {
    this.secondaryOAM.fill(value);
  }

  getAddress() {
    return this.address[0];
  }

  setAddress(address) {
    this.address[0] = address;
  }

  getSpriteCount() {
    return this.spriteCount;
  }

  clearSpriteCount() {
    this.spriteCount = 0;
  }

  getCoordinateX(index) {
    return this.secondaryOAM[index + this.X_BYTE];
  }

  getTileID(index) {
    return this.secondaryOAM[index + this.TILE_ID_BYTE];
  }

  /**
   * 8x8 Sprite Mode. The control register determines the pattern table. A tile is 8x8 pixels, i.e., 8 pixels on 8 rows.
   * The difference between the current scanline and the sprite's Y coordinate is used to determine the corresponding cell row.
   *
   * @param sprite        the sprite whose tile cell is of interest
   * @param scanline      the current scanline
   * @returns {number}    tile cell ORed with the cell row
   */
  getTileCellAndRow8by8(sprite, scanline) {
    const tileCell = this.getTileID(sprite) << 4;   // Tile ID * 16 (16 bytes per tile)
    let cellRow;
    if (this.isFlippedVertically(sprite)) {
      cellRow = 7 - (scanline - this.getCoordinateY(sprite)); // Which Row in cell? (7 to 0)
    } else {
      cellRow = scanline - this.getCoordinateY(sprite); // Which Row in cell? (0 to 7)
    }

    return tileCell | cellRow;
  }

  /**
   * 8x16 Sprite Mode - The sprite attribute determines the pattern table. A tile is 8x16 pixels, i.e., 8 pixels on 16 rows.
   * Reading Top half, or Bottom Half, Tile of 8x16 Sprite.
   *
   * @param sprite          the 8x16 sprite
   * @param scanline        the current scanline
   * @returns {number}      tile cell ORed with the cell row
   */
  getHalfTileCellAndRow8by16(sprite, scanline) {
    const patternTable = ((this.getTileID(sprite) & 0x01) << 12);
    let tileCell;
    let tileRow;
    const tileTopHalf = (scanline - this.getCoordinateY(sprite)) < 8;   // Truthy if top half of tile, bottom half otherwise

    if (this.isFlippedVertically(sprite)) {
      tileRow = (7 - (scanline - this.getCoordinateY(sprite)) & 0x07);
      tileCell = tileTopHalf ? (((this.getTileID(sprite) & 0xFE) + 1) << 4) : ((this.getTileID(sprite) & 0xFE) << 4);
    } else {
      tileRow = ((scanline - this.getCoordinateY(sprite)) & 0x07);
      tileCell = tileTopHalf ? ((this.getTileID(sprite) & 0xFE) << 4) : (((this.getTileID(sprite) & 0xFE) + 1) << 4);
    }

    return patternTable | tileCell | tileRow;
  }

  getAttributes(index) {
    return this.secondaryOAM[index + this.ATTRIBUTES_BYTE];
  }

  isFlippedVertically(sprite) {
    return this.getAttributes(sprite) & 0x80; // A Sprite that is flipped vertically is upside down
  }

  isFlippedHorizontally(sprite) {
    return this.getAttributes(sprite) & 0x40;
  }

  getCoordinateY(index) {
    return this.secondaryOAM[index];
  }

  /**
   *
   * PPU sprite evaluation is an operation done by the PPU once each scanline. It prepares the set of sprites and
   * fetches their data to be rendered on the next scanline.
   *
   * Evaluate which sprites are visible in the next scanline. Iterates through the OAM until 8 sprites are found that
   * have Y-positions and heights that are within vertical range of the next scanline. When 8 sprites are found, or the OAM
   * is exhausted, the method terminates. Notice the count to 9 sprites. The sprite overflow flag is set in the event
   * of there being more than 8 sprites.
   *
   * @param scanline      the current scanline
   * @param spriteSize    8 or 16 pixels
   * @returns {boolean}   true if there is a possible Sprite Zero Hit, false otherwise
   */
  spriteEvaluation(scanline, spriteSize) {
    let spriteZeroHitPossible = false;
    let OAMEntry = 0;
    while (OAMEntry < this.OAM_BYTES && this.spriteCount < 9) {
      let diff = new Int16Array(1);
      diff[0] = scanline - this.OAM[OAMEntry];
      if (diff[0] >= 0 && diff[0] < spriteSize && this.spriteCount < this.MAX_SPRITE_COUNT) {
        if (this.spriteCount < this.MAX_SPRITE_COUNT) {
          if (OAMEntry === 0) {     // Is sprite zero?
            spriteZeroHitPossible = true;
          }
          this.secondaryOAM[this.spriteCount * this.SPRITE_BYTES] = this.OAM[OAMEntry];           // Copy OAE Y
          this.secondaryOAM[this.spriteCount * this.SPRITE_BYTES + this.TILE_ID_BYTE] = this.OAM[OAMEntry + this.TILE_ID_BYTE];   // Copy OAE Tile ID
          this.secondaryOAM[this.spriteCount * this.SPRITE_BYTES + this.ATTRIBUTES_BYTE] = this.OAM[OAMEntry + this.ATTRIBUTES_BYTE];   // Copy OAE Attributes
          this.secondaryOAM[this.spriteCount * this.SPRITE_BYTES + this.X_BYTE] = this.OAM[OAMEntry + this.X_BYTE];   // Copy OAE X
        }
        this.spriteCount++;
      }
      OAMEntry += this.SPRITE_BYTES;
    }

    return spriteZeroHitPossible;
  }

  /**
   * Retrieve palette information (bit 0 and bit 1 of the attributes byte represent the sprite's palette).
   *
   * @param index   the index of the desired sprite
   * @returns {number}  the palette (4 to 7) of the sprite
   */
  getSpritePalette(index) {
    return (this.secondaryOAM[index + this.ATTRIBUTES_BYTE] & 0x03) + 0x04;
  }

  /**
   * Retrieve the Sprite's priority (bit 5 of the attributes byte).
   *
   * @param index   the index of the desired sprite
   * @returns {number}  1 if sprite is in front of the background; 0 if sprite is behind the background
   */
  getSpritePriority(index) {
    return (this.secondaryOAM[index + this.ATTRIBUTES_BYTE] & 0x20) === 0 ? 1 : 0;
  }

  reset() {
    this.spriteCount = 0;
    this.address[0] = 0x00;
    this.OAM = new Uint8Array(0x100);
    this.secondaryOAM = new Uint8Array(0x20);
  }
}


