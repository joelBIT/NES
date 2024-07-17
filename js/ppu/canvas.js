/**
 * Represents the screen that the player sees. All pixels of a frame are stored before the frame is rendered to the screen.
 */
export class Canvas {
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
}
