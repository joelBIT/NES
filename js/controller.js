/**
 * The NES Controller has a simple four button layout. It consists of two round buttons labeled "A" and "B",
 * a "START" button, and a "SELECT" button. Additionally, the controllers utilized the cross-shaped joypad.
 *
 */
export class Controller {
  button = 0x00;

  pressA() {
    this.button |= 0x80;
  }

  releaseA() {
    this.button &= (~(1 << 7)) & 0xff;
  }

  pressB() {
    this.button |= 0x40;
  }

  releaseB() {
    this.button &= (~(1 << 6)) & 0xff;
  }

  pressStart() {
    this.button |= 0x10;
  }

  releaseStart() {
    this.button &= (~(1 << 4)) & 0xff;
  }

  pressSelect() {
    this.button |= 0x20;
  }

  releaseSelect() {
    this.button &= (~(1 << 5)) & 0xff;
  }

  pressUp() {
    this.button |= 0x08;
  }

  releaseUp() {
    this.button &= (~(1 << 3)) & 0xff;
  }

  pressDown() {
    this.button |= 0x04;
  }

  releaseDown() {
    this.button &= (~(1 << 2)) & 0xff;
  }

  pressRight() {
    this.button |= 0x01;
  }

  releaseRight() {
    this.button &= (~(1 << 0)) & 0xff;
  }

  pressLeft() {
    this.button |= 0x02;
  }

  releaseLeft() {
    this.button &= (~(1 << 1)) & 0xff;
  }

  getCurrentButton() {
    return this.button;
  }
}
