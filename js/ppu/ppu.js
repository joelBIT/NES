import { MemoryArea } from "./memory.js";
import { MaskRegister } from "./registers/mask.js";
import { ControlRegister } from './registers/control.js';
import { LoopyRegister } from './registers/loopy.js';
import { StatusRegister } from './registers/status.js';
import { NameTable } from "./nametable.js";

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
  palettes = new MemoryArea();      // contains the colors
  nameTables = new NameTable();       // describes the layout of the background
  patternTable1 = new MemoryArea(4096);
  patternTable2 = new MemoryArea(4096);

  addressOAM = new Uint8Array(1);    // Some ports may access the OAM directly on this address
  OAM = new Uint8Array(0x100);     // contains approximately 64 sprites (256 bytes), where each sprite's information occupies 4 bytes
  secondaryOAM = new Uint8Array(0x20);   // Stores information about up to 8 sprites
  spriteCount = 0;    // How many sprites we find from the OAM that are going to be rendered on the next scanline, fill secondaryOAM with those

  // Sprite Zero Collision Flags
  spriteZeroHitPossible = false;
  spriteZeroBeingRendered = false;

  loopyVRAM = new LoopyRegister();      // Active "pointer" address into nametable to extract background tile info
  loopyTRAM = new LoopyRegister();      // Temporary store of information to be "transferred" into "pointer" at various times
  fineX;

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

  palScreen = [
    [101,101,101], [0,45,105], [19,31,127], [60,19,124], [96,11,98], [115,10,55], [113,15,7], [90,26,0], [52,40,0], [11,52,0],
    [0,60,0], [0,61,16], [0,56,64], [0,0,0], [0,0,0], [0,0,0], [174,174,174], [15,99,179], [64,81,208], [120,65,204], [167,54,169],
    [192,52,112], [189,60,48], [159,74,0], [109,92,0], [54,109,0], [7,119,4], [0,121,61], [0,114,125], [0,0,0], [0,0,0], [0,0,0],
    [254,254,255], [93,179,255], [143,161,255], [200,144,255], [247,133,250], [255,131,192], [255,139,127], [239,154,73],
    [189,172,44], [133,188,47], [85,199,83], [60,201,140], [62,194,205], [78,78,78], [0,0,0], [0,0,0], [254,254,255], [188,223,255],
    [209,216,255], [232,209,255], [251,205,253], [255,204,229], [255,207,202], [248,213,180], [228,220,168], [204,227,169],
    [185,232,184], [174,232,208], [175,229,234], [182,182,182], [0,0,0], [0,0,0]
  ];

  // Background rendering
  bgNextTileID = new Uint8Array(1);
  bgNextTileAttribute = new Uint8Array(1);
  bgNextTileLSB = new Uint8Array(1);
  bgNextTileMSB = new Uint8Array(1);
  bgShifterPatternLow = new Uint16Array(1);
  bgShifterPatternHigh = new Uint16Array(1);
  bgShifterAttributeLow = new Uint16Array(1);
  bgShifterAttributeHigh = new Uint16Array(1);

  spriteShifterPatternLow = new Uint8Array(8);      // Low-bit plane of the sprite
  spriteShifterPatternHigh = new Uint8Array(8);      // High-bit plane of the sprite

  cartridge;
  ctx;
  canvasImageData;        // Contains the pixel information that is rendered each frame

  setContext(context) {
    this.ctx = context;
    this.canvasImageData = this.ctx.getImageData(0, 0, 256, 240);
  }

  /**
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
      if (this.loopyVRAM.getCoarseX() === 31) {
        this.loopyVRAM.setCoarseX(0);
        this.loopyVRAM.setNameTableX(this.loopyVRAM.getNameTableX() > 0 ? 0 : 1);     // Flip a bit
      } else {
        this.loopyVRAM.setCoarseX(this.loopyVRAM.getCoarseX() + 1);
      }
    }
  }

  incrementScrollY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      if (this.loopyVRAM.getFineY() < 7) {
        this.loopyVRAM.setFineY(this.loopyVRAM.getFineY() + 1);
      } else {
        this.loopyVRAM.setFineY(0);
        if (this.loopyVRAM.getCoarseY() === 29) {
          this.loopyVRAM.setCoarseY(0);
          this.loopyVRAM.setNameTableY(this.loopyVRAM.getNameTableY() > 0 ? 0 : 1);   // Flip a bit
        } else if (this.loopyVRAM.getCoarseY() === 31) {
          this.loopyVRAM.setCoarseY(0);
        } else {
          this.loopyVRAM.setCoarseY(this.loopyVRAM.getCoarseY() + 1);
        }
      }
    }
  }

  transferAddressX() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.loopyVRAM.setNameTableX(this.loopyTRAM.getNameTableX());
      this.loopyVRAM.setCoarseX(this.loopyTRAM.getCoarseX());
    }
  }

  transferAddressY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.loopyVRAM.setFineY(this.loopyTRAM.getFineY());
      this.loopyVRAM.setNameTableY(this.loopyTRAM.getNameTableY());
      this.loopyVRAM.setCoarseY(this.loopyTRAM.getCoarseY());
    }
  }

  /**
   * 8 pixels in scanline
   */
  loadBackgroundShifters() {
    this.bgShifterPatternLow[0] = (this.bgShifterPatternLow[0] & 0xFF00) | this.bgNextTileLSB[0];
    this.bgShifterPatternHigh[0] = (this.bgShifterPatternHigh[0] & 0xFF00) | this.bgNextTileMSB[0];

    this.bgShifterAttributeLow[0] = (this.bgShifterAttributeLow[0] & 0xFF00) | ((this.bgNextTileAttribute[0] & 0b01) > 0 ? 0xFF : 0x00);
    this.bgShifterAttributeHigh[0] = (this.bgShifterAttributeHigh[0] & 0xFF00) | ((this.bgNextTileAttribute[0] & 0b10) > 0 ? 0xFF : 0x00);
  }

  /**
   * Shifting background tile pattern row and palette attributes by 1
   */
  updateShifters() {
    if (this.maskRegister.getRenderBackground()) {
      this.bgShifterPatternLow[0] <<= 1;
      this.bgShifterPatternHigh[0] <<= 1;

      this.bgShifterAttributeLow[0] <<= 1;
      this.bgShifterAttributeHigh[0] <<= 1;
    }

    if (this.maskRegister.getRenderSprites() && this.cycle >= 1 && this.cycle < 258) {
      for (let i = 0, j = 0; i < this.spriteCount; i++, j += 4) {
        if (this.secondaryOAM[j + 3] > 0) {     // OAE X
          this.secondaryOAM[j + 3]--;
        } else {
          this.spriteShifterPatternLow[i] <<= 1;
          this.spriteShifterPatternHigh[i] <<= 1;
        }
      }
    }
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
        this.statusRegister.setVerticalBlank(0);        // Effectively start of new frame, so clear vertical blank flag
        this.statusRegister.setSpriteOverflow(0);
        this.statusRegister.setSpriteZeroHit(0);
        // Clear Shifters
        for (let i = 0; i < 8; i++) {
          this.spriteShifterPatternHigh[i] = 0;
          this.spriteShifterPatternLow[i] = 0;
        }
      }

      if (this.scanline === 0 && this.cycle === 0 && this.oddFrame && (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites())) {
        this.cycle = 1;     // "Odd Frame" cycle skip
      }

      if ((this.cycle >= 2 && this.cycle < 258) || (this.cycle >= 321 && this.cycle < 338)) {
        this.updateShifters();

        switch ((this.cycle - 1) % 8) {    // These cycles are for pre-loading the PPU with the information it needs to render the next 8 pixels
          case 0:
            this.loadBackgroundShifters();          // Load the current background tile pattern and attributes into the "shifter"
            this.bgNextTileID[0] = this.readMemory(0x2000 | (this.loopyVRAM.getRegister() & 0x0FFF));
            break;
          case 2:
            this.bgNextTileAttribute[0] = this.readMemory(0x23C0 | (this.loopyVRAM.getNameTableY() << 11)
              | (this.loopyVRAM.getNameTableX() << 10)
              | ((this.loopyVRAM.getCoarseY() >> 2) << 3)
              | (this.loopyVRAM.getCoarseX() >> 2));
            if (this.loopyVRAM.getCoarseY() & 0x02) {
              this.bgNextTileAttribute[0] >>= 4;
            }
            if (this.loopyVRAM.getCoarseX() & 0x02) {
              this.bgNextTileAttribute[0] >>= 2;
            }
            this.bgNextTileAttribute[0] &= 0x03;
            break;
          case 4:
            this.bgNextTileLSB[0] = this.readMemory((this.controlRegister.getPatternBackground() << 12)
              + (this.bgNextTileID[0] << 4)
              + this.loopyVRAM.getFineY());
            break;
          case 6:
            this.bgNextTileMSB[0] = this.readMemory((this.controlRegister.getPatternBackground() << 12)
              + (this.bgNextTileID[0] << 4)
              + this.loopyVRAM.getFineY() + 8);
            break;
          case 7:
            this.incrementScrollX();
            break;
        }
      }

      if (this.cycle === 256) {   // End of a visible scanline, increment downwards
        this.incrementScrollY();
      }

      if (this.cycle === 257) {   //  Reset the X position
        this.loadBackgroundShifters();
        this.transferAddressX();
      }

      if (this.cycle === 338 || this.cycle === 340) {
        this.bgNextTileID[0] = this.readMemory(0x2000 | (this.loopyVRAM.getRegister() & 0x0FFF));
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
        this.secondaryOAM.fill(0xFF);
        this.spriteCount = 0;

        // Secondly, clear out any residual information in sprite pattern shifters
        for (let i = 0; i < 8; i++) {
          this.spriteShifterPatternLow[i] = 0;
          this.spriteShifterPatternHigh[i] = 0;
        }
        this.spriteZeroHitPossible = false;

        let OAMEntry = 0;
        while (OAMEntry < 256 && this.spriteCount < 9) {
          let diff = new Int16Array(1);
          diff[0] = this.scanline - this.OAM[OAMEntry];
          if (diff[0] >= 0 && diff[0] < (this.controlRegister.getSpriteSize() ? 16 : 8) && this.spriteCount < 8) {
            if (this.spriteCount < 8) {
              if (OAMEntry === 0) {     // Is this sprite sprite zero?
                this.spriteZeroHitPossible = true;
              }
              this.secondaryOAM[this.spriteCount * 4] = this.OAM[OAMEntry];           // Copy OAE Y
              this.secondaryOAM[this.spriteCount * 4 + 1] = this.OAM[OAMEntry + 1];   // Copy OAE Tile ID
              this.secondaryOAM[this.spriteCount * 4 + 2] = this.OAM[OAMEntry + 2];   // Copy OAE Attributes
              this.secondaryOAM[this.spriteCount * 4 + 3] = this.OAM[OAMEntry + 3];   // Copy OAE X
            }
            this.spriteCount++;
          }
          OAMEntry += 4;
        } // End of sprite evaluation for next scanline

        if (this.spriteCount >= 8) {
          this.statusRegister.setSpriteOverflow(1);
        } else {
          this.statusRegister.setSpriteOverflow(0);
        }
      }

      if (this.cycle === 340) {   // The end of the scanline, Prepare the sprite shifters with the 8 or less selected sprites.
        for (let i = 0, j = 0; i < this.spriteCount; i++, j += 4) {
          const spritePatternBitsLow = new Uint8Array(1);
          const spritePatternBitsHigh = new Uint8Array(1);
          const spritePatternAddressLow = new Uint16Array(1);
          const spritePatternAddressHigh = new Uint16Array(1);
          if (!this.controlRegister.getSpriteSize()) {
            // 8x8 Sprite Mode - The control register determines the pattern table
            if (!(this.secondaryOAM[j + 2] & 0x80)) {   // OAE attributes
              // Sprite is NOT flipped vertically, i.e. normal
              spritePatternAddressLow[0] = (this.controlRegister.getPatternSprite() << 12)  // Which Pattern Table? 0KB or 4KB offset
                | (this.secondaryOAM[j + 1] << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                | (this.scanline - this.secondaryOAM[j]); // Which Row in cell? (0->7)    (OAE X)
            } else {
              // Sprite is flipped vertically, i.e. upside down
              spritePatternAddressLow[0] = (this.controlRegister.getPatternSprite() << 12)  // Which Pattern Table? 0KB or 4KB offset
                | (this.secondaryOAM[j + 1] << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                | (7 - (this.scanline - this.secondaryOAM[j])); // Which Row in cell? (7->0)
            }
          } else {
            // 8x16 Sprite Mode - The sprite attribute determines the pattern table
            if (!(this.secondaryOAM[j + 2] & 0x80)) {       // OAE attributes
              // Sprite is NOT flipped vertically, i.e. normal
              if ((this.scanline - this.secondaryOAM[j]) < 8) {    // OAE Y
                // Reading Top half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)  // Which Pattern Table? 0KB or 4KB offset
                  | ((this.secondaryOAM[j + 1] & 0xFE) << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | ((this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              } else {
                // Reading Bottom Half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)  // Which Pattern Table? 0KB or 4KB offset
                  | (((this.secondaryOAM[j + 1] & 0xFE) + 1) << 4)  // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | ((this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              }
            } else {
              // Sprite is flipped vertically, i.e. upside down
              if ((this.scanline - this.secondaryOAM[j]) < 8) {
                // Reading Top half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)    // Which Pattern Table? 0KB or 4KB offset
                  | (((this.secondaryOAM[j + 1] & 0xFE) + 1) << 4)    // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | (7 - (this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              } else {
                // Reading Bottom Half Tile
                spritePatternAddressLow[0] = ((this.secondaryOAM[j + 1] & 0x01) << 12)    // Which Pattern Table? 0KB or 4KB offset
                  | ((this.secondaryOAM[j + 1] & 0xFE) << 4)    // Which Cell? Tile ID * 16 (16 bytes per tile)
                  | (7 - (this.scanline - this.secondaryOAM[j]) & 0x07); // Which Row in cell? (0->7)
              }
            }
          }

          // High bit plane equivalent is always offset by 8 bytes from lo bit plane
          spritePatternAddressHigh[0] = spritePatternAddressLow[0] + 8;

          // Now we have the address of the sprite patterns, we can read them
          spritePatternBitsLow[0] = this.readMemory(spritePatternAddressLow[0]);
          spritePatternBitsHigh[0] = this.readMemory(spritePatternAddressHigh[0]);

          // If the sprite is flipped horizontally, we need to flip the pattern bytes.
          if (this.secondaryOAM[j + 2] & 0x40) {
            // Flip Patterns Horizontally
            spritePatternBitsHigh[0] = this.reverseBits(spritePatternBitsHigh[0]);
            spritePatternBitsLow[0] = this.reverseBits(spritePatternBitsLow[0]);
          }

          // Load the pattern into sprite shift registers ready for rendering on the next scanline
          this.spriteShifterPatternLow[i] = spritePatternBitsLow[0];
          this.spriteShifterPatternHigh[i] = spritePatternBitsHigh[0];
        }
      }
    }

    if (this.scanline === 240) {

    }

    if (this.scanline >= 241 && this.scanline < 261) {
      if (this.scanline === 241 && this.cycle === 1) {
        this.statusRegister.setVerticalBlank(1);
        if (this.controlRegister.getEnableNMI()) {
          this.nmi = true;                                // The PPU must inform the CPU about the nmi(), and this can be done in the bus
        }
      }
    }

    // Background =============================================================
    let bgPixel = 0x00;                                     // The 2-bit pixel to be rendered
    let bgPalette = 0x00;                                   // The 3-bit index of the palette the pixel indexes
    if (this.maskRegister.getRenderBackground()) {
      if (this.maskRegister.getRenderBackgroundLeft() || (this.cycle >= 9)) {
        const bitMux = new Uint16Array(1);
        bitMux[0] = 0x8000 >> this.fineX;
        const pixelPlane0 = (this.bgShifterPatternLow[0] & bitMux[0]) > 0 ? 1 : 0;
        const pixelPlane1 = (this.bgShifterPatternHigh[0] & bitMux[0]) > 0 ? 1 : 0;
        bgPixel = (pixelPlane1 << 1) | pixelPlane0;         // Combine to form pixel index

        const pal0 = (this.bgShifterAttributeLow[0] & bitMux[0]) > 0 ? 1 : 0;
        const pal1 = (this.bgShifterAttributeHigh[0] & bitMux[0]) > 0 ? 1 : 0;
        bgPalette = (pal1 << 1) | pal0;
      }
    }

    // Foreground =============================================================
    let fgPixel = 0x00;     // The 2-bit pixel to be rendered
    let fgPalette = 0x00;   // The 3-bit index of the palette the pixel indexes
    let fgPriority = 0x00;  // A bit of the sprite attribute indicates if its

    if (this.maskRegister.getRenderSprites()) {
      if (this.maskRegister.getRenderSpritesLeft() || (this.cycle >= 9)) {
        this.spriteZeroBeingRendered = false;
        for (let i = 0, j = 0; i < this.spriteCount; i++, j += 4) {
          // Scanline cycle has "collided" with sprite, shifters taking over
          if (this.secondaryOAM[j + 3] === 0) {   // OAE X, If X coordinate = 0, start to draw sprites
            let fg_pixel_lo = (this.spriteShifterPatternLow[i] & 0x80) > 0 ? 1 : 0;
            let fg_pixel_hi = (this.spriteShifterPatternHigh[i] & 0x80) > 0 ? 1 : 0;
            fgPixel = (fg_pixel_hi << 1) | fg_pixel_lo;

            fgPalette = (this.secondaryOAM[j + 2] & 0x03) + 0x04;     // OAE attributes
            fgPriority = (this.secondaryOAM[j + 2] & 0x20) === 0 ? 1 : 0;    // OAE attributes

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

    // Decide if the background pixel or the sprite pixel has priority. It is possible for sprites
    // to go behind background tiles that are not "transparent" (value 0).
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
        // Sprite zero is a collision between foreground and background
        // so they must both be enabled
        if (this.maskRegister.getRenderBackground() & this.maskRegister.getRenderSprites()) {
          // The left edge of the screen has specific switches to control its appearance.
          // This is used to smooth inconsistencies when scrolling (since sprites X coordinate must be >= 0)
          if (!(this.maskRegister.getRenderBackgroundLeft() | this.maskRegister.getRenderSpritesLeft())) {
            if (this.cycle >= 9 && this.cycle < 258) {
              this.statusRegister.setSpriteZeroHit(1);
            }
          } else {
            if (this.cycle >= 1 && this.cycle < 258) {
              this.statusRegister.setSpriteZeroHit(1);
            }
          }
        }
      }
    }

    // At each location on the screen we want to store a pixel's X and Y coordinate along with the pixel's color
    //this.storePixel(this.cycle - 1, this.scanline, this.getColorFromPalScreen(palette, pixel));
    this.setCanvasImageData(this.cycle - 1, this.scanline, this.getColorFromPalScreen(palette, pixel));

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
        this.statusRegister.setVerticalBlank(0);
        this.addressLatch = 0;
        return result;
      case 0x0003: // OAM Address
        break;
      case 0x0004: // OAM Data
        return this.OAM[this.addressOAM[0]];
      case 0x0005: // Scroll
        break;
      case 0x0006: // PPU Address
        break;
      case 0x0007: // PPU Data
        let data  = this.dataBuffer;
        this.dataBuffer = this.readMemory(this.loopyVRAM.getRegister());
        if (this.loopyVRAM.getRegister() >= 0x3F00) {   // Handle palette addresses
          data = this.dataBuffer;
        }
        this.loopyVRAM.setRegister(this.loopyVRAM.getRegister() + (this.controlRegister.getIncrementMode() ? 32 : 1));
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
        this.loopyTRAM.setNameTableX(this.controlRegister.getNameTableX());
        this.loopyTRAM.setNameTableY(this.controlRegister.getNameTableY());
        break;
      case 0x0001: // Mask
        this.maskRegister.setRegister(data);
        break;
      case 0x0002: // Status
        break;
      case 0x0003: // OAM Address
        this.addressOAM[0] = data;
        break;
      case 0x0004: // OAM Data
        this.OAM[this.addressOAM[0]] = data;
        break;
      case 0x0005: // Scroll
        if (this.addressLatch === 0) {      // Address latch is used to indicate if I am writing to the low byte or the high byte
          this.fineX = data & 0x07;     // offset (0 - 7) into a single cell
          this.loopyTRAM.setCoarseX(data >> 3);
          this.addressLatch = 1;
        } else {
          this.loopyTRAM.setFineY(data & 0x07);
          this.loopyTRAM.setCoarseY(data >> 3);
          this.addressLatch = 0;
        }
        break;
      case 0x0006: // PPU Address
        if (this.addressLatch === 0) {
          this.loopyTRAM.setRegister(((data & 0x3F) << 8) | (this.loopyTRAM.getRegister() & 0x00FF));   // Store the lower 8 bits of the PPU address
          this.addressLatch = 1;
        } else {
          this.loopyTRAM.setRegister((this.loopyTRAM.getRegister() & 0xFF00) | data);     // LoopyTram holds the desired scroll address which the PPU uses to refresh loopyV
          this.loopyVRAM.setRegister(this.loopyTRAM.getRegister());
          this.addressLatch = 0;
        }
        break;
      case 0x0007: // PPU Data
        this.writeMemory(this.loopyVRAM.getRegister(), data);
        // Skip 32 tiles at a time along the X-axis (which is the same as going down 1 row in the Y-axis), or increment 1 along the X-axis
        this.loopyVRAM.setRegister(this.loopyVRAM.getRegister() + (this.controlRegister.getIncrementMode() ? 32 : 1));
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
  getColorFromPalScreen(palette, pixel) {
    return this.palScreen[this.readMemory(0x3F00 + (palette << 2) + pixel) & 0x3F];
  }

  reset() {
    this.fineX = 0x00;
    this.addressLatch = 0x00;
    this.dataBuffer = 0x00;
    this.scanline = 0;
    this.cycle = 0;
    this.bgShifterAttributeHigh[0] = 0x0000;
    this.bgShifterAttributeLow[0] = 0x0000;
    this.bgShifterPatternLow[0] = 0x0000;
    this.bgShifterPatternHigh[0] = 0x0000;
    this.bgNextTileID[0] = 0x00;
    this.bgNextTileAttribute[0] = 0x00;
    this.bgNextTileLSB[0] = 0x00;
    this.bgNextTileMSB[0] = 0x00;
    this.statusRegister.setRegister(0x00);
    this.maskRegister.setRegister(0x00);
    this.controlRegister.setRegister(0x00);
    this.loopyVRAM.setRegister(0x0000);
    this.loopyTRAM.setRegister(0x0000);
    this.scanlineTrigger = false;
    this.oddFrame = false;
    this.palettes = new MemoryArea();
    this.nameTables.reset();
    this.patternTable1 = new MemoryArea(4096);
    this.patternTable2 = new MemoryArea(4096);
  }
}

export const ppu = new PPU();
