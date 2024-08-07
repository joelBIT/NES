/**
 * The PPU Control Register. This register contains various flags controlling PPU operation.
 *
 *
 * 7  bit  0
 * ---- ----
 * VPHB SINN
 * |||| ||||
 * |||| ||++- Base nametable address
 * |||| ||    (0 = $2000; 1 = $2400; 2 = $2800; 3 = $2C00)
 * |||| |+--- VRAM address increment per CPU read/write of PPUDATA
 * |||| |     (0: add 1, going across; 1: add 32, going down)
 * |||| +---- Sprite pattern table address for 8x8 sprites
 * ||||       (0: $0000; 1: $1000; ignored in 8x16 mode)
 * |||+------ Background pattern table address (0: $0000; 1: $1000)
 * ||+------- Sprite size (0: 8x8 pixels; 1: 8x16 pixels – see PPU OAM#Byte 1)
 * |+-------- PPU master/slave select
 * |          (0: read backdrop from EXT pins; 1: output color on EXT pins)
 * +--------- Generate an NMI at the start of the
 *            vertical blanking interval (0: off; 1: on)
 *
 *
 * Bit 0: Name table X
 * Bit 1: Name table Y
 * Bit 2: Increment mode. VRAM address increment per CPU read/write of PPUDATA (0: add 1, going across; 1: add 32, going down).
 * Bit 3: Sprite pattern table address for 8x8 sprites.
 * Bit 4: Background pattern table address (0: $0000; 1: $1000).
 * Bit 5: Sprite size (0: 8x8 pixels; 1: 8x16 pixels).
 * Bit 6: Slave mode (unused).
 * Bit 7: Enable NMI. Generate an NMI at the start of the vertical blanking interval (0: off; 1: on).
 *
 *
 *
 * Equivalently, bits 1 and 0 are the most significant bit of the scrolling coordinates:
 *
 * 7  bit  0
 * ---- ----
 * .... ..YX
 *        ||
 *        |+- 1: Add 256 to the X scroll position
 *        +-- 1: Add 240 to the Y scroll position
 *
 * Another way of seeing the explanation above is that when you reach the end of a nametable, you must switch to the
 * next one, hence, changing the nametable address.
 *
 */
export class ControlRegister {
  control = new Uint8Array(1);

  getNameTableX() {
    return (this.control[0] & 0x01);
  }

  getNameTableY() {
    return (this.control[0] & 0x02) >> 1;
  }

  getIncrementMode() {
    return (this.control[0] & 0x04) >> 2;
  }

  /**
   * Skip 32 tiles at a time along the X-axis (which is the same as going down 1 row in the Y-axis), or increment 1 along
   * the X-axis.
   *
   * @returns {number}    return 1 if going 1 step along the X-axis; return 32 if going down 1 row on the Y-axis
   */
  getIncrementMovement() {
    return this.getIncrementMode() ? 32 : 1;
  }

  getSpritePatternTableNumber() {
    return (this.control[0] & 0x08) >> 3;
  }

  getSpritePatternTableAddress() {
    return this.getSpritePatternTableNumber() << 12;    // Which Pattern Table? 0KB or 4KB offset depending on number
  }

  getBackgroundPatternTableNumber() {
    return (this.control[0] & 0x10) >> 4;
  }

  getBackgroundPatternTableAddress() {
    return this.getBackgroundPatternTableNumber() << 12;  // Which Pattern Table? 0KB or 4KB offset depending on number
  }

  getSpriteSize() {
    return (this.control[0] & 0x20) >> 5;
  }

  /**
   * Checks bit 5 (Sprite size) if it is 1 (8x16 pixels) or 0 (8x8 pixels) and returns 16 if 8x16 (due to the sprites having
   * 16 rows of 8 pixels), or 8 if 8x8 (due to the sprites having 8 rows of 8 pixels).
   *
   * @returns {number}    the number of rows of sprites
   */
  getSpriteSizeInRows() {
    return this.getSpriteSize() ? 16 : 8;
  }

  isSpriteSize8by8() {
    return this.getSpriteSize() === 0 ? 1 : 0;
  }

  isNmiEnabled() {
    return (this.control[0] & 0x80) >> 7;
  }

  setRegister(data) {
    this.control[0] = data;
  }

  reset() {
    this.control[0] = 0x00;
  }
}
