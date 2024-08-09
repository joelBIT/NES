import { MemoryArea } from "./memory.js";
import { MaskRegister } from "./registers/mask.js";
import { ControlRegister } from './registers/control.js';
import { ScrollRegister } from './registers/scroll.js';
import { StatusRegister } from './registers/status.js';
import { NameTableContainer } from "./nametable.js";
import { Color } from './color.js';
import { Background } from "./background/background.js";
import { Foreground } from "./foreground/foreground.js";
import { Pixel, Type } from "./pixel.js";
import { Canvas } from "./canvas.js";

/**
 * Picture Processing Unit - generates a composite video signal with 240 lines of pixels to a screen.
 * The CPU talks to the PPU via 8 (actually 9) registers using addresses 0x2000 - 0x2007 (although they are
 * mirrored over a larger address range).
 */
class PPU {
  palettes = new MemoryArea();                 // contains the colors
  nameTables = new NameTableContainer();       // describes the layout of the background
  END_OF_SCANLINE = 340;
  END_OF_VISIBLE_SCANLINE = 256;
  VERTICAL_BLANK_LINE_START = 241;
  POST_RENDER_IDLE_LINE = 240;
  PRE_RENDER_LINE = 261;
  VISIBLE_FRAME_START = 0;
  PRE_VISIBLE_FRAME_LINE = -1;
  RESET_X_POSITION = 257;
  SPRITE_BYTES = 4;

  scrollVRAM = new ScrollRegister();      // Active "pointer" address into nametable to extract background tile info
  scrollTRAM = new ScrollRegister();      // Temporary store of information to be "transferred" into "pointer" at various times

  statusRegister = new StatusRegister();
  maskRegister = new MaskRegister();
  controlRegister = new ControlRegister();

  oddFrame = false;
  nmi = false;
  scanline = 0;     // Represent which row of the screen, a scanline is 1 pixel high
  cycle = 0;        // Represent current column of the screen
  frameComplete = false;
  addressLatch = 0x00;      // Address latch is used to indicate if write is to the low byte or the high byte
  dataBuffer = 0x00;   // When we read data from the PPU it is delayed by 1 cycle so we need to buffer that byte

  // Background rendering
  background = new Background();

  // Foreground rendering
  foreground = new Foreground();

  cartridge;
  canvas = new Canvas();

  setContext(context) {
    this.canvas.setContext(context);
  }

  connectCartridge(cartridge) {
    this.cartridge = cartridge;
  }

  writeOAM(address, data) {
    this.foreground.writeOAM(address, data);
  }

  isNMI() {
    return this.nmi;
  }

  clearNMI() {
    this.nmi = false;
  }

  incrementScrollX() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.scrollVRAM.incrementScrollX();
    }
  }

  /**
   *  Increment downwards to the next scanline when reaching the end of a visible scanline,
   */
  incrementScrollY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.scrollVRAM.incrementScrollY();
    }
  }

  /**
   * Reset the X position to the beginning of the new scanline.
   */
  transferAddressX() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.scrollVRAM.transferAddressX(this.scrollTRAM);
    }
  }

  transferAddressY() {
    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      this.scrollVRAM.transferAddressY(this.scrollTRAM);
    }
  }

  /**
   * Every cycle the shifters storing pattern and attribute information shift their contents by 1 bit.
   */
  updateShifters() {
    if (this.maskRegister.getRenderBackground()) {
      this.background.shift();
    }

    if (this.maskRegister.getRenderSprites() && this.cycle >= 1 && this.cycle < 258) {
      this.foreground.spriteShift();
    }
  }

  /**
   * Selects the target nametable, and attribute byte offset. Attribute memory begins at 0x03C0 within a nametable. This
   * address is offset with 0x2000 so we get 0x23C0.
   */
  setTileAttribute() {
    const attributeByte = this.readMemory(0x23C0 | this.scrollVRAM.getAttributeMemoryOffset());
    this.background.setTileAttribute(this.scrollVRAM.getPaletteBits(attributeByte));
  }

  setTileLSB() {
    this.background.setTileLSB(this.readMemory((this.controlRegister.getBackgroundPatternTableAddress())
      + this.background.getTileCell() + this.scrollVRAM.getFineY()));
  }

  setTileMSB() {
    this.background.setTileMSB(this.readMemory((this.controlRegister.getBackgroundPatternTableAddress())
      + this.background.getTileCell() + this.scrollVRAM.getFineY() + 8));
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
    if (this.scanline >= this.PRE_VISIBLE_FRAME_LINE && this.scanline < this.POST_RENDER_IDLE_LINE) {

      /*
              ************************
              | Background Rendering |
              ************************
       */

      // We leave the vertical blank period when we are at the top left of the screen, which is when scanline is -1 and cycle = 1
      if (this.scanline === this.PRE_VISIBLE_FRAME_LINE && this.cycle === 1) {
        this.statusRegister.reset();
        this.foreground.clearShifters();
      }

      if (this.scanline === this.VISIBLE_FRAME_START && this.cycle === 0 && this.oddFrame && (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites())) {
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

      if (this.cycle === this.END_OF_VISIBLE_SCANLINE) {
        this.incrementScrollY();
      }

      if (this.cycle === this.RESET_X_POSITION) {
        this.background.loadShifter();
        this.transferAddressX();
      }

      if (this.cycle === 338 || this.cycle === this.END_OF_SCANLINE) {
        this.background.setTileID(this.readMemory(0x2000 | (this.scrollVRAM.getRegister() & 0x0FFF)));
      }

      if (this.scanline === this.PRE_VISIBLE_FRAME_LINE && this.cycle >= 280 && this.cycle < 305) {    // End of vertical blank period so reset the Y address ready for rendering
        this.transferAddressY();
      }

      /*
            ************************
            | Foreground Rendering |
            ************************
     */
      if (this.cycle === 257 && this.scanline >= this.VISIBLE_FRAME_START) {
        this.foreground.initializeForegroundRendering();

        this.foreground.clearShifters();
        this.foreground.setSpriteZeroHitPossible(this.foreground.spriteEvaluation(this.scanline, this.controlRegister.getSpriteSizeInRows()));

        if (this.foreground.getSpriteCount() >= 8) {
          this.statusRegister.setSpriteOverflow();
        } else {
          this.statusRegister.clearSpriteOverflow();
        }
      }

      if (this.cycle === this.END_OF_SCANLINE) {
        this.loadSpritePatternsForNextScanline();
      }
    }

    if (this.scanline === this.VERTICAL_BLANK_LINE_START && this.cycle === 1) {
      this.statusRegister.setVerticalBlank();
      if (this.controlRegister.isNmiEnabled()) {
        this.nmi = true;                                // The PPU must inform the CPU about the nmi(), and this can be done in the bus
      }
    }

    if (this.cycle >= 1 && this.cycle < 258) {
      this.checkIfSpriteZeroHit();
    }

    let { pixel, palette } = this.getPrioritizedPixel();
    this.canvas.setCanvasImageData(this.cycle - 1, this.scanline, this.getColor(palette, pixel));

    this.cycle++;

    if (this.maskRegister.getRenderBackground() || this.maskRegister.getRenderSprites()) {
      if (this.cycle === 260 && this.scanline < this.POST_RENDER_IDLE_LINE) {
        this.cartridge.getMapper().scanLine();
      }
    }

    if (this.cycle > this.END_OF_SCANLINE) {
      this.endOfScanline();
      if (this.scanline >= this.PRE_RENDER_LINE) {
        this.endOfFrame();
      }
    }

    if (this.cartridge.getMapper().hasCycleCounter()) {
      this.cartridge.getMapper().tickCycleCounter();
    }
  }

  /**
   * At the end of a scanline, prepare the sprite shifters with the 8 or less selected sprites.
   */
  loadSpritePatternsForNextScanline() {
    for (let i = 0, sprite = 0; i < this.foreground.getSpriteCount(); i++, sprite += this.SPRITE_BYTES) {
      this.foreground.clearSpriteData();
      if (this.controlRegister.isSpriteSize8by8()) {
        this.foreground.setSpriteAddressLow(this.controlRegister.getSpritePatternTableAddress()
          | this.foreground.getTileCellAndRow8by8(sprite, this.scanline));
      } else {
        this.foreground.setSpriteAddressLow(this.foreground.getHalfTileCellAndRow8by16(sprite, this.scanline));
      }

      // High bit plane equivalent is always offset by 8 bytes from low bit plane
      this.foreground.setSpriteAddressHigh(this.foreground.getSpriteAddressLow() + 8);

      // Now we have the address of the sprite patterns, we can read them
      this.foreground.setSpriteDataLow(this.readMemory(this.foreground.getSpriteAddressLow()));
      this.foreground.setSpriteDataHigh(this.readMemory(this.foreground.getSpriteAddressHigh()));

      // If the sprite is flipped horizontally, we need to flip the pattern bytes.
      if (this.foreground.isFlippedHorizontally(sprite)) {
        this.foreground.flipSpriteDataBits();
      }

      // Load the pattern into sprite shift registers ready for rendering on the next scanline
      this.foreground.setPatternLow(i, this.foreground.getSpriteDataLow());
      this.foreground.setPatternHigh(i, this.foreground.getSpriteDataHigh());
    }
  }

  /**
   * When the last cycle (dot) of a scanline is reached the scanline variable is incremented so that the next scanline
   * becomes the current one. To start in the beginning of this new scanline the cycle variable is set to 0.
   *
   */
  endOfScanline() {
    this.cycle = 0;
    this.scanline++;
  }

  /**
   * When the end of a frame is reached, draw that frame on the canvas, and set scanline to -1 in order to begin on
   * the next frame. The frameComplete boolean is set to true so that the emulator knows when a complete frame has been
   * rendered.
   */
  endOfFrame() {
    this.canvas.drawImageData();
    this.scanline = -1;
    this.frameComplete = true;
    this.oddFrame = !this.oddFrame;
  }

  /**
   *  The (sprite) pixel to be rendered in the foreground. An empty sprite is returned if no sprite pixel is to be rendered.
   */
  getForegroundPixel() {
    if (this.maskRegister.getRenderSprites() && (this.maskRegister.getRenderSpritesLeft() || (this.cycle >= 9))) {
      return this.foreground.getPixel();
    }
    return new Pixel(0x00, Type.FOREGROUND, 0x00);
  }

  /**
   *  A pixel to be rendered in the background. Returns an empty pixel if background is not supposed to be rendered.
   */
  getBackgroundPixel() {
    if (this.maskRegister.getRenderBackground() && (this.maskRegister.getRenderBackgroundLeft() || (this.cycle >= 9))) {
      return this.background.getPixel();
    }
    return new Pixel(0x00, Type.EMPTY, 0x00);
  }

  /**
   * Decide if the background pixel or the sprite pixel has priority. It is possible for sprites
   * to go behind background tiles that are not "transparent" (value 0).
   *
   */
  getPrioritizedPixel() {
    let bgPixel = this.getBackgroundPixel();
    let fgPixel = this.getForegroundPixel();
    return bgPixel.comparePriority(fgPixel);
  }

  /**
   * Sprite zero is a collision between foreground and background so they must both be enabled. The left edge of the
   * screen has specific switches to control its appearance. This is used to smooth inconsistencies when scrolling
   * (since sprites X coordinate must be >= 0).
   */
  checkIfSpriteZeroHit() {
    if (this.foreground.isSpriteZeroHitPossible() && this.foreground.isSpriteZeroBeingRendered()
          && (this.maskRegister.getRenderBackground() & this.maskRegister.getRenderSprites())) {
      if (this.maskRegister.getRenderBackgroundLeft() | this.maskRegister.getRenderSpritesLeft()) {
        this.statusRegister.setSpriteZeroHit();
      } else {
        if (this.cycle >= 9 && this.cycle < 258) {
          this.statusRegister.setSpriteZeroHit();
        }
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
        return this.foreground.getOAM();
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
        this.scrollVRAM.setRegister(this.scrollVRAM.getRegister() + this.controlRegister.getIncrementMovement());
        return data;
    }

    return 0x00;
  }

  /**
   * The PPU exposes eight memory-mapped registers to the CPU. These nominally sit at $2000 through $2007 in the
   * CPU's address space, but because their addresses are incompletely decoded, they're mirrored in every 8 bytes
   * from $2008 through $3FFF. For example, a write to $3456 is the same as a write to $2006.
   *
   * 0x2000 CTRL    responsible for configuring the PPU to render in different ways
   * 0x2001 MASK    decides whether background or sprites are being drawn, and what's happening at the edges of the screen
   * 0x2002 STATUS  tells when it is safe to render
   *
   * 0x2005 SCROLL  through this register we can represent game worlds far larger than we can see on the screen
   * 0x2006 ADDRESS allows the CPU to directly read and write to the PPU's memory
   * 0x2007 DATA    allows the CPU to directly read and write to the PPU's memory
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
        this.foreground.writeAddressOAM(data);
        break;
      case 0x0004: // OAM Data
        this.foreground.writeOAM(data);
        break;
      case 0x0005: // Scroll
        if (this.addressLatch === 0) {
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
        this.scrollVRAM.setRegister(this.scrollVRAM.getRegister() + this.controlRegister.getIncrementMovement());
        break;
    }
  }

  readMemory(address) {
    address &= 0x3FFF;
    if (address >= 0x0000 && address <= 0x1FFF) {
      return this.cartridge.readByPPU(address);
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
    if (address >= 0x0000 && address <= 0x1FFF) {
      this.cartridge.writeByPPU(address, data);
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
    this.oddFrame = false;
    this.palettes = new MemoryArea();
    this.nameTables.reset();
  }
}

export const ppu = new PPU();
