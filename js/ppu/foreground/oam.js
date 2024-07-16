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

  getOAM(index) {
    return this.OAM[index];
  }

  writeOAM(index, data) {
    this.OAM[index] = data;
  }

  getSecondaryOAM(index) {
    return this.secondaryOAM[index];
  }

  decrementSecondaryOAM(index) {
    this.secondaryOAM[index]--;
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
    while (OAMEntry < 256 && this.spriteCount < 9) {
      let diff = new Int16Array(1);
      diff[0] = scanline - this.OAM[OAMEntry];
      if (diff[0] >= 0 && diff[0] < spriteSize && this.spriteCount < 8) {
        if (this.spriteCount < 8) {
          if (OAMEntry === 0) {     // Is sprite zero?
            spriteZeroHitPossible = true;
          }
          this.secondaryOAM[this.spriteCount * 4] = this.OAM[OAMEntry];           // Copy OAE Y
          this.secondaryOAM[this.spriteCount * 4 + 1] = this.OAM[OAMEntry + 1];   // Copy OAE Tile ID
          this.secondaryOAM[this.spriteCount * 4 + 2] = this.OAM[OAMEntry + 2];   // Copy OAE Attributes
          this.secondaryOAM[this.spriteCount * 4 + 3] = this.OAM[OAMEntry + 3];   // Copy OAE X
        }
        this.spriteCount++;
      }
      OAMEntry += 4;
    }

    return spriteZeroHitPossible;
  }

  /**
   * Retrieve palette information (bit 0 and bit 1 of the attributes byte represent the sprite's palette).
   *
   * @param index   the index of the desired sprite's attribute byte
   * @returns {number}  the palette (4 to 7) of the sprite
   */
  getPalette(index) {
    return (this.secondaryOAM[index] & 0x03) + 0x04;     // OAE attributes
  }

  reset() {
    this.spriteCount = 0;
    this.address[0] = 0x00;
    this.OAM = new Uint8Array(0x100);
    this.secondaryOAM = new Uint8Array(0x20);
  }
}


