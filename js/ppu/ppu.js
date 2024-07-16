import { MemoryArea } from "./memory.js";
import { MaskRegister } from "./registers/mask.js";
import { ControlRegister } from './registers/control.js';
import { ScrollRegister } from './registers/scroll.js';
import { StatusRegister } from './registers/status.js';
import { NameTableContainer } from "./nametable.js";
import { Color } from './color.js';
import { Background } from "./background/background.js";
import { Foreground } from "./foreground/foreground.js";
import { OAM } from "./foreground/oam.js";

/**
 * Picture Processing Unit - generates a composite video signal with 240 lines of pixels to a screen.
 * The CPU talks to the PPU via 8 (actually 9) registers using addresses 0x2000 - 0x2007 (although they are
 * mirrored over a larger address range).
 *
 * 0x2000 CTRL    responsible for configuring the PPU to render in different ways
 * 0x2001 MASK    decides whether background or sprites are being drawn, and what's happening at the edges of the screen
 * 0x2002 STATUS  tells when it is safe to render

 * 0x2005 SCROLL  through this register we can represent game worlds far larger than we can see on the screen
 * 0x2006 ADDRESS allows the CPU to directly read and write to the PPU's memory
 * 0x2007 DATA    allows the CPU to directly read and write to the PPU's memory
 */
class PPU {
  palettes = new MemoryArea();                 // contains the colors
  nameTables = new NameTableContainer();       // describes the layout of the background
  patternTable1 = new MemoryArea(4096);
  patternTable2 = new MemoryArea(4096);

  OAM = new OAM();        // Contains approximately 64 sprites (256 bytes), where each sprite's information occupies 4 bytes

  spriteZeroHitPossible = false;
  spriteZeroBeingRendered = false;

  scrollVRAM = new ScrollRegister();      // Active "pointer" address into nametable to extract background tile info
  scrollTRAM = new ScrollRegister();      // Temporary store of information to be "transferred" into "pointer" at various times

  statusRegister = new StatusRegister();
  maskRegister = new MaskRegister();
  controlRegister = new ControlRegister();

  oddFrame = false;
  scanlineTrigger = false;
  nmi = false;
  scanline = 0;     // Represent which row of the screen, a scanline is 1 pixel high
  cycle = 0;        // Represent current column of the screen
  frameComplete = false;
  addressLatch = 0x00;      // This is used to govern writing to the low byte or high byte
  dataBuffer;   // When we read data from the PPU it is delayed by 1 cycle so we need to buffer that byte

  // Background rendering
  background = new Background();

  // Foreground rendering
  foreground = new Foreground();

  cartridge;
  ctx;
  canvasImageData;        // Contains the pixel information that is rendered each frame

  setContext(context) {
    this.ctx = context;
    this.canvasImageData = this.ctx.getImageData(0, 0, 256, 240);
  }

  /**
   * At each location on the screen we want to store a pixel's X and Y coordinate along with the pixel's color.
   *
   * Stores a pixel in an array for later rendering. The offset corresponds to the pixels' location (X, Y) on the screen
   * and its color (RGBA) is stored in the 4 bytes from the offset, where A = 255;
   */
  setCanvasImageData(x, y, palette) {
    let offset = (y * 256 + x) * 4;
    this.canvasImageData.data[offset] = palette[0];
    this.canvasImageData.data[offset + 1] = palette[1];
    this.canvasImageData.data[offset + 2] = palette[2];
    this.canvasImageData.data[offset + 3] = 255;
  }

  /**
   * Add the current frame to the canvas.
   */
  drawImageData() {
    this.ctx.putImageData(this.canvasImageData, 0, 0);
  }

  connectCartridge(cartridge) {
    this.cartridge = cartridge;
  }

  writeOAM(address, data) {
    this.OAM.writeData(address, data);
  }

  isNMI() {
    return this.nmi;
  }

  setNMI(value) {
    this.nmi = value;
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
   * To facilitate scrolling the NES stores two Nametables that lies next to each other. As the viewable area of the screen scrolls across
   * it crosses this boundary and we render from two different nametables simultaneously. The CPU is tasked with updating the invisible
   * parts of the nametable with the bits of level that are going to be seen next. When the viewable window scrolls past the end of
   * the second nametable, it is wrapped back around into the first one, and this allows you to have a continuous scrolling motion
   * in two directions.
   */
  incrementScrollX() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      if (this.scrollVRAM.getCoarseX() === 31) {
        this.scrollVRAM.setCoarseX(0);
        this.scrollVRAM.setNameTableX(this.scrollVRAM.getNameTableX() > 0 ? 0 : 1);     // Flip a bit
      } else {
        this.scrollVRAM.setCoarseX(this.scrollVRAM.getCoarseX() + 1);
      }
    }
  }

  incrementScrollY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      if (this.scrollVRAM.getFineY() < 7) {
        this.scrollVRAM.setFineY(this.scrollVRAM.getFineY() + 1);
      } else {
        this.scrollVRAM.setFineY(0);
        if (this.scrollVRAM.getCoarseY() === 29) {
          this.scrollVRAM.setCoarseY(0);
          this.scrollVRAM.setNameTableY(this.scrollVRAM.getNameTableY() > 0 ? 0 : 1);   // Flip a bit
        } else if (this.scrollVRAM.getCoarseY() === 31) {
          this.scrollVRAM.setCoarseY(0);
        } else {
          this.scrollVRAM.setCoarseY(this.scrollVRAM.getCoarseY() + 1);
        }
      }
    }
  }

  transferAddressX() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.scrollVRAM.setNameTableX(this.scrollTRAM.getNameTableX());
      this.scrollVRAM.setCoarseX(this.scrollTRAM.getCoarseX());
    }
  }

  transferAddressY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.scrollVRAM.setFineY(this.scrollTRAM.getFineY());
      this.scrollVRAM.setNameTableY(this.scrollTRAM.getNameTableY());
      this.scrollVRAM.setCoarseY(this.scrollTRAM.getCoarseY());
    }
  }

  updateShifters() {
    if (this.maskRegister.getRenderBackground()) {
      this.background.shift();
    }

    if (this.maskRegister.getRenderSprites() && this.cycle >= 1 && this.cycle < 258) {
      for (let i = 0, sprite = 0; i < this.OAM.getSpriteCount(); i++, sprite += 4) {
        if (this.OAM.getCoordinateX(sprite) > 0) {
          this.OAM.decrementCoordinateX(sprite);
        } else {
          this.foreground.shift(i);
        }
      }
    }
  }

  /**
   * All attribute memory begins at 0x03C0 within a nametable.
   */
  setTileAttribute() {
    this.background.setTileAttribute(this.readMemory(0x23C0 | (this.scrollVRAM.getNameTableY() << 11)
      | (this.scrollVRAM.getNameTableX() << 10)
      | ((this.scrollVRAM.getCoarseY() >> 2) << 3)
      | (this.scrollVRAM.getCoarseX() >> 2)));
    if (this.scrollVRAM.getCoarseY() & 0x02) {
      this.background.setTileAttribute(this.background.getTileAttribute() >> 4);
    }
    if (this.scrollVRAM.getCoarseX() & 0x02) {
      this.background.setTileAttribute(this.background.getTileAttribute() >> 2);
    }
    this.background.setTileAttribute(this.background.getTileAttribute() & 0x03);
  }

  setTileLSB() {
    this.background.setTileLSB(this.readMemory((this.controlRegister.getPatternBackground() << 12)
      + (this.background.getTileID() << 4)
      + this.scrollVRAM.getFineY()));
  }

  setTileMSB() {
    this.background.setTileMSB(this.readMemory((this.controlRegister.getPatternBackground() << 12)
      + (this.background.getTileID() << 4)
      + this.scrollVRAM.getFineY() + 8));
  }

  /**
   * The PPU is actively drawing screen state during scanlines  0 - 240.
   * During scanlines 241 - 262, the CPU is updating the state of the PPU for the next frame.
   *
   * Scanlines represent the horizontal rows across the screen. The NES is 256 pixels across this line, and 240 pixels down.
   * However, the scanline can exceed this dimension. One cycle is one pixel across the scanline (crudly). Since the scanline goes
   * beyond the edge of the screen so does the cycle count. There are 341 cycles per scanline (an approximation). Scanlines
   * continue under the bottom of the screen. Thus there are 261 scanlines. This period of unseen scanlines is called the
   * Vertical Blanking Period.
   *
   * Once the vertical blank period has started, the CPU can change the nature of the PPU. It is during this period
   * that the CPU is setting up the PPU for the next frame. In this emulator a -1 scanline is used as a starting point
   * after the last scanline in the period is finished.
   *
   * It is important that the CPU finishes what it is doing while the screen is being rendered, otherwise we will get lag.
   * The vertical_blank bit in the STATUS word tells us if we are in screen space (0) or vertical blank period (1).
   * The CPU might have to wait an entire frame before the screen is updated.
   */
  clock() {
    if (this.scanline >= -1 && this.scanline < 240) {

      /*
              ************************
              | Background Rendering |
              ************************
       */

      // We leave the vertical blank period when we are at the top left of the screen, which is when scanline is -1 and cycle = 1
      if (this.scanline === -1 && this.cycle === 1) {
        this.statusRegister.clearVerticalBlank();        // Effectively start of new frame, so clear vertical blank flag
        this.statusRegister.clearSpriteOverflow();
        this.statusRegister.clearSpriteZeroHit();
        this.foreground.reset();
      }

      if (this.scanline === 0 && this.cycle === 0 && this.oddFrame && (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites())) {
        this.cycle = 1;     // "Odd Frame" cycle skip
      }

      if ((this.cycle >= 2 && this.cycle < 258) || (this.cycle >= 321 && this.cycle < 338)) {
        this.updateShifters();

        switch ((this.cycle - 1) % 8) {    // These cycles are for pre-loading the PPU with the information it needs to render the next 8 pixels
          case 0:
            this.background.loadShifter();
            this.background.setTileID(this.readMemory(0x2000 | (this.scrollVRAM.getRegister() & 0x0FFF)));
            break;
          case 2:
            this.setTileAttribute();
            break;
          case 4:
            this.setTileLSB();
            break;
          case 6:
            this.setTileMSB();
            break;
          case 7:
            this.incrementScrollX();
            break;
        }
      }

      if (this.cycle === 256) {   // End of a visible scanline, increment downwards to the next scanline
        this.incrementScrollY();
      }

      if (this.cycle === 257) {   //  Reset the X position to the beginning of the new scanline
        this.background.loadShifter();
        this.transferAddressX();
      }

      if (this.cycle === 338 || this.cycle === 340) {
        this.background.setTileID(this.readMemory(0x2000 | (this.scrollVRAM.getRegister() & 0x0FFF)));
      }

      if (this.scanline === -1 && this.cycle >= 280 && this.cycle < 305) {    // End of vertical blank period so reset the Y address ready for rendering
        this.transferAddressY();
      }

      /*
            ************************
            | Foreground Rendering |
            ************************
     */
      if (this.cycle === 257 && this.scanline >= 0) {
        this.OAM.fillSecondaryOAM(0xFF);
        this.OAM.clearSpriteCount();

        this.foreground.reset();
        this.spriteZeroHitPossible = this.OAM.spriteEvaluation(this.scanline, (this.controlRegister.getSpriteSize() ? 16 : 8));

        if (this.OAM.getSpriteCount() >= 8) {
          this.statusRegister.setSpriteOverflow();
        } else {
          this.statusRegister.clearSpriteOverflow();
        }
      }

      if (this.cycle === 340) {   // The end of the scanline, Prepare the sprite shifters with the 8 or less selected sprites.
        for (let i = 0, sprite = 0; i < this.OAM.getSpriteCount(); i++, sprite += 4) {
          this.foreground.clearSpriteData();
          if (!this.controlRegister.getSpriteSize()) {
            // 8x8 Sprite Mode - The control register determines the pattern table
            if (!(this.OAM.getAttributes(sprite) & 0x80)) {
              // Sprite is NOT flipped vertically, i.e. normal
              this.foreground.setSpriteAddressLow((this.controlRegister.getPatternSprite() << 12)  // Which Pattern Table? 0KB or 4KB offset
                | (this.OAM.getTileID(sprite) << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                | (this.scanline - this.OAM.getCoordinateY(sprite))); // Which Row in cell? (0->7)
            } else {
              // Sprite is flipped vertically, i.e. upside down
              this.foreground.setSpriteAddressLow((this.controlRegister.getPatternSprite() << 12)  // Which Pattern Table? 0KB or 4KB offset
                | (this.OAM.getTileID(sprite) << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                | (7 - (this.scanline - this.OAM.getCoordinateY(sprite)))); // Which Row in cell? (7->0)
            }
          } else {
            // 8x16 Sprite Mode - The sprite attribute determines the pattern table
            if (!(this.OAM.getAttributes(sprite) & 0x80)) {
              // Sprite is NOT flipped vertically, i.e. normal
              if ((this.scanline - this.OAM.getCoordinateY(sprite)) < 8) {
                // Reading Top half Tile
                this.foreground.setSpriteAddressLow(((this.OAM.getTileID(sprite) & 0x01) << 12)
                  | ((this.OAM.getTileID(sprite) & 0xFE) << 4)
                  | ((this.scanline - this.OAM.getCoordinateY(sprite)) & 0x07));
              } else {
                // Reading Bottom Half Tile
                this.foreground.setSpriteAddressLow(((this.OAM.getTileID(sprite) & 0x01) << 12)
                  | (((this.OAM.getTileID(sprite) & 0xFE) + 1) << 4)
                  | ((this.scanline - this.OAM.getCoordinateY(sprite)) & 0x07));
              }
            } else {
              // Sprite is flipped vertically, i.e. upside down
              if ((this.scanline - this.OAM.getCoordinateY(sprite)) < 8) {
                // Reading Top half Tile
                this.foreground.setSpriteAddressLow(((this.OAM.getTileID(sprite) & 0x01) << 12)
                  | (((this.OAM.getTileID(sprite) & 0xFE) + 1) << 4)
                  | (7 - (this.scanline - this.OAM.getCoordinateY(sprite)) & 0x07));
              } else {
                // Reading Bottom Half Tile
                this.foreground.setSpriteAddressLow(((this.OAM.getTileID(sprite) & 0x01) << 12)
                  | ((this.OAM.getTileID(sprite) & 0xFE) << 4)
                  | (7 - (this.scanline - this.OAM.getCoordinateY(sprite)) & 0x07));
              }
            }
          }

          // High bit plane equivalent is always offset by 8 bytes from lo bit plane
          this.foreground.setSpriteAddressHigh(this.foreground.getSpriteAddressLow() + 8);

          // Now we have the address of the sprite patterns, we can read them
          this.foreground.setSpriteDataLow(this.readMemory(this.foreground.getSpriteAddressLow()));
          this.foreground.setSpriteDataHigh(this.readMemory(this.foreground.getSpriteAddressHigh()));

          // If the sprite is flipped horizontally, we need to flip the pattern bytes.
          if (this.OAM.getAttributes(sprite) & 0x40) {
            // Flip Patterns Horizontally
            this.foreground.setSpriteDataHigh(this.reverseBits(this.foreground.getSpriteDataHigh()));
            this.foreground.setSpriteDataLow(this.reverseBits(this.foreground.getSpriteDataLow()));
          }

          // Load the pattern into sprite shift registers ready for rendering on the next scanline
          this.foreground.setPatternLow(i, this.foreground.getSpriteDataLow());
          this.foreground.setPatternHigh(i, this.foreground.getSpriteDataHigh());
        }
      }
    }

    if (this.scanline === 240) {
      // The PPU just idles during this scanline. Even though accessing PPU memory from the program would be safe here,
      // the VBlank flag isn't set until after this scanline.
    }

    if (this.scanline === 241 && this.cycle === 1) {
      this.statusRegister.setVerticalBlank();
      if (this.controlRegister.getEnableNMI()) {
        this.nmi = true;                                // The PPU must inform the CPU about the nmi(), and this can be done in the bus
      }
    }

    let { pixel, palette } = this.getPrioritizedPixel();
    this.setCanvasImageData(this.cycle - 1, this.scanline, this.getColor(palette, pixel));

    this.cycle++;

    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      if (this.cycle === 260 && this.scanline < 240) {
        this.cartridge.getMapper().scanLine();
      }
    }

    if (this.cycle >= 341) {
      this.cycle = 0;
      this.scanline++;
      if (this.scanline >= 261) {
        this.drawImageData();
        this.scanline = -1;
        this.frameComplete = true;
        this.oddFrame = !this.oddFrame;
      }
    }
  }

  /**
   *  The (sprite) pixel to be rendered in the foreground at a specific x and y location.
   */
  getForegroundPixel() {
    let fgPixel = 0x00;     // The 2-bit pixel to be rendered
    let fgPalette = 0x00;   // The 3-bit index of the palette the pixel indexes
    let fgPriority = 0x00;
    if (this.maskRegister.getRenderSprites()) {
      if (this.maskRegister.getRenderSpritesLeft() || (this.cycle >= 9)) {
        this.spriteZeroBeingRendered = false;
        for (let i = 0, sprite = 0; i < this.OAM.getSpriteCount(); i++, sprite += 4) {
          // Scanline cycle has "collided" with sprite, shifters taking over
          if (this.OAM.getCoordinateX(sprite) === 0) {   // OAE X, If X coordinate is 0, start to draw sprites
            fgPixel = this.foreground.getPixel(i);
            fgPalette = this.OAM.getSpritePalette(sprite);
            fgPriority = this.OAM.getSpritePriority(sprite);

            if (fgPixel !== 0) {
              if (i === 0) {
                this.spriteZeroBeingRendered = true;
              }
              break;
            }
          }
        }
      }
    }
    return { fgPixel, fgPalette, fgPriority };
  }

  /**
   *  The pixel to be rendered in the background at a specific x and y location.
   */
  getBackgroundPixel() {
    let bgPixel = 0x00;                                     // The 2-bit pixel to be rendered
    let bgPalette = 0x00;                                   // The 3-bit index of the palette the pixel indexes
    if (this.maskRegister.getRenderBackground()) {
      if (this.maskRegister.getRenderBackgroundLeft() || (this.cycle >= 9)) {
        bgPixel = this.background.getPixel();
        bgPalette = this.background.getPalette();
      }
    }

    return { bgPixel, bgPalette };
  }

  /**
   * Decide if the background pixel or the sprite pixel has priority. It is possible for sprites
   * to go behind background tiles that are not "transparent" (value 0).
   *
   */
  getPrioritizedPixel() {
    let { bgPixel, bgPalette } = this.getBackgroundPixel();
    let { fgPixel, fgPalette, fgPriority } = this.getForegroundPixel();
    let pixel = 0x00;
    let palette = 0x00;
    if (bgPixel === 0 && fgPixel > 0) {
      pixel = fgPixel;
      palette = fgPalette;
    } else if (bgPixel > 0 && fgPixel === 0) {
      pixel = bgPixel;
      palette = bgPalette;
    } else if (bgPixel > 0 && fgPixel > 0) {
      if (fgPriority) {
        pixel = fgPixel;
        palette = fgPalette;
      } else {
        pixel = bgPixel;
        palette = bgPalette;
      }

      if (this.spriteZeroHitPossible && this.spriteZeroBeingRendered) {   // Sprite Zero Hit detection
        // Sprite zero is a collision between foreground and background so they must both be enabled
        if (this.maskRegister.getRenderBackground() & this.maskRegister.getRenderSprites()) {
          // The left edge of the screen has specific switches to control its appearance.
          // This is used to smooth inconsistencies when scrolling (since sprites X coordinate must be >= 0)
          if (!(this.maskRegister.getRenderBackgroundLeft() | this.maskRegister.getRenderSpritesLeft())) {
            if (this.cycle >= 9 && this.cycle < 258) {
              this.statusRegister.setSpriteZeroHit();
            }
          } else {
            if (this.cycle >= 1 && this.cycle < 258) {
              this.statusRegister.setSpriteZeroHit();
            }
          }
        }
      }
    }
    return { pixel, palette };
  }

  isFrameCompleted() {
    return this.frameComplete;
  }

  /**
   * The PPU exposes eight memory-mapped registers to the CPU. These nominally sit at $2000 through $2007 in the
   * CPU's address space, but because their addresses are incompletely decoded, they're mirrored in every 8 bytes
   * from $2008 through $3FFF. For example, a write to $3456 is the same as a write to $2006.
   *
   */
  readRegister(address) {
    switch (address) {
      case 0x0000: // Control
        break;
      case 0x0001: // Mask
        break;
      case 0x0002: // Status
        // The act of reading is changing the state of the device
        const result = (this.statusRegister.getRegister() & 0xE0) | (this.dataBuffer & 0x1F);
        this.statusRegister.clearVerticalBlank();
        this.addressLatch = 0;
        return result;
      case 0x0003: // OAM Address
        break;
      case 0x0004: // OAM Data
        return this.OAM.getData(this.OAM.getAddress());
      case 0x0005: // Scroll
        break;
      case 0x0006: // PPU Address
        break;
      case 0x0007: // PPU Data
        let data  = this.dataBuffer;
        this.dataBuffer = this.readMemory(this.scrollVRAM.getRegister());
        if (this.scrollVRAM.getRegister() >= 0x3F00) {   // Handle palette addresses
          data = this.dataBuffer;
        }
        this.scrollVRAM.setRegister(this.scrollVRAM.getRegister() + (this.controlRegister.getIncrementMode() ? 32 : 1));
        return data;
    }

    return 0x00;
  }

  /**
   * The PPU exposes eight memory-mapped registers to the CPU. These nominally sit at $2000 through $2007 in the
   * CPU's address space, but because their addresses are incompletely decoded, they're mirrored in every 8 bytes
   * from $2008 through $3FFF. For example, a write to $3456 is the same as a write to $2006.
   *
   */
  writeRegister(address, data) {
    switch (address) {
      case 0x0000: // Control
        this.controlRegister.setRegister(data);
        this.scrollTRAM.setNameTableX(this.controlRegister.getNameTableX());
        this.scrollTRAM.setNameTableY(this.controlRegister.getNameTableY());
        break;
      case 0x0001: // Mask
        this.maskRegister.setRegister(data);
        break;
      case 0x0002: // Status
        break;
      case 0x0003: // OAM Address
        this.OAM.setAddress(data);
        break;
      case 0x0004: // OAM Data
        this.OAM.writeData(this.OAM.getAddress(), data);
        break;
      case 0x0005: // Scroll
        if (this.addressLatch === 0) {      // Address latch is used to indicate if I am writing to the low byte or the high byte
          this.background.setFineX(data & 0x07);
          this.scrollTRAM.setCoarseX(data >> 3);
          this.addressLatch = 1;
        } else {
          this.scrollTRAM.setFineY(data & 0x07);
          this.scrollTRAM.setCoarseY(data >> 3);
          this.addressLatch = 0;
        }
        break;
      case 0x0006: // PPU Address
        if (this.addressLatch === 0) {
          this.scrollTRAM.setRegister(((data & 0x3F) << 8) | (this.scrollTRAM.getRegister() & 0x00FF));   // Store the lower 8 bits of the PPU address
          this.addressLatch = 1;
        } else {
          this.scrollTRAM.setRegister((this.scrollTRAM.getRegister() & 0xFF00) | data);     // Tram holds the desired scroll address which the PPU uses to refresh VRAM
          this.scrollVRAM.setRegister(this.scrollTRAM.getRegister());
          this.addressLatch = 0;
        }
        break;
      case 0x0007: // PPU Data
        this.writeMemory(this.scrollVRAM.getRegister(), data);
        // Skip 32 tiles at a time along the X-axis (which is the same as going down 1 row in the Y-axis), or increment 1 along the X-axis
        this.scrollVRAM.setRegister(this.scrollVRAM.getRegister() + (this.controlRegister.getIncrementMode() ? 32 : 1));
        break;
    }
  }

  readMemory(address) {
    address &= 0x3FFF;
    const read = this.cartridge.readByPPU(address);
    if (read) {
      return read.data;
    } else if (address >= 0x0000 && address <= 0x1FFF) {
      if ((address & 0x1000) >> 12) {
        return this.patternTable2.read(address & 0x0FFF);
      } else {
        return this.patternTable1.read(address & 0x0FFF);
      }
    } else if (address >= 0x2000 && address <= 0x3EFF) {
      address &= 0x0FFF;
      return this.nameTables.read(address, this.cartridge.getMirror());
    } else if (address >= 0x3F00 && address <= 0x3FFF) {
      address &= 0x001F;
      if (address === 0x0010) {
        address = 0x0000;
      } else if (address === 0x0014) {
        address = 0x0004;
      } else if (address === 0x0018) {
        address = 0x0008;
      } else if (address === 0x001C) {
        address = 0x000C;
      }
      return this.palettes.read(address) & ((this.maskRegister.getGrayScale() > 0) ? 0x30 : 0x3F);
    }
    return 0x00;
  }

  writeMemory(address, data) {
    address &= 0x3FFF;

    if (this.cartridge.writeByPPU(address, data)) {

    } else if (address >= 0x0000 && address <= 0x1FFF) {
      if ((address & 0x1000) >> 12) {
        this.patternTable2.write(address & 0x0FFF, data);
      } else {
        this.patternTable1.write(address & 0x0FFF, data);
      }
    } else if (address >= 0x2000 && address <= 0x3EFF) {
      address &= 0x0FFF;
      this.nameTables.write(address, data, this.cartridge.getMirror());
    } else if (address >= 0x3F00 && address <= 0x3FFF) {
      address &= 0x001F;
      if (address === 0x0010) {
        address = 0x0000;
      } else if (address === 0x0014) {
        address = 0x0004;
      } else if (address === 0x0018) {
        address = 0x0008;
      } else if (address === 0x001C) {
        address = 0x000C;
      }
      this.palettes.write(address, data);
    }
  }

  /**
   *  Returns a screen color corresponding to the given palette and pixel index.
   * "0x3F00"       - Offset into PPU addressable range where palettes are stored
   * "palette << 2" - Each palette is 4 bytes in size
   * "pixel"        - Each pixel index is either 0, 1, 2 or 3
   * "& 0x3F"       - Prevents reading beyond the bounds of the palScreen array
   */
  getColor(palette, pixel) {
    return Color[this.readMemory(0x3F00 + (palette << 2) + pixel) & 0x3F];
  }

  reset() {
    this.addressLatch = 0x00;
    this.dataBuffer = 0x00;
    this.scanline = 0;
    this.cycle = 0;
    this.background.reset();
    this.foreground.reset();
    this.statusRegister.reset();
    this.maskRegister.reset();
    this.controlRegister.reset();
    this.scrollVRAM.reset();
    this.scrollTRAM.reset();
    this.OAM.reset();
    this.scanlineTrigger = false;
    this.oddFrame = false;
    this.palettes = new MemoryArea();
    this.nameTables.reset();
    this.patternTable1 = new MemoryArea(4096);
    this.patternTable2 = new MemoryArea(4096);
  }
}

export const ppu = new PPU();
