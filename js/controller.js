/**
 * The NES Controller has a simple four button layout. It consists of two round buttons labeled "A" and "B",
 * a "START" button, and a "SELECT" button. Additionally, the controllers utilized the cross-shaped joypad.
 *
 */
export class Controller {
  activeButton = 0x00;
  a;
  b;
  start;
  select;
  up;
  down;
  right;
  left;

  pressA() {
    this.activeButton |= 0x80;
  }

  releaseA() {
    this.activeButton &= (~(1 << 7)) & 0xff;
  }

  pressB() {
    this.activeButton |= 0x40;
  }

  releaseB() {
    this.activeButton &= (~(1 << 6)) & 0xff;
  }

  pressStart() {
    this.activeButton |= 0x10;
  }

  releaseStart() {
    this.activeButton &= (~(1 << 4)) & 0xff;
  }

  pressSelect() {
    this.activeButton |= 0x20;
  }

  releaseSelect() {
    this.activeButton &= (~(1 << 5)) & 0xff;
  }

  pressUp() {
    this.activeButton |= 0x08;
  }

  releaseUp() {
    this.activeButton &= (~(1 << 3)) & 0xff;
  }

  pressDown() {
    this.activeButton |= 0x04;
  }

  releaseDown() {
    this.activeButton &= (~(1 << 2)) & 0xff;
  }

  pressRight() {
    this.activeButton |= 0x01;
  }

  releaseRight() {
    this.activeButton &= (~(1 << 0)) & 0xff;
  }

  pressLeft() {
    this.activeButton |= 0x02;
  }

  releaseLeft() {
    this.activeButton &= (~(1 << 1)) & 0xff;
  }

  getActiveButton() {
    return this.activeButton;
  }

  reset() {
    this.activeButton = 0x00;
  }

  getA() {
    return this.a;
  }

  setA(a) {
    this.a = a;
  }

  getB() {
    return this.b;
  }

  setB(b) {
    this.b = b;
  }

  getSelect() {
    return this.select;
  }

  setSelect(select) {
    this.select = select;
  }

  getStart() {
    return this.start;
  }

  setStart(start) {
    this.start = start;
  }

  getUp() {
    return this.up;
  }

  setUp(up) {
    this.up = up;
  }

  getDown() {
    return this.down;
  }

  setDown(down) {
    this.down = down;
  }

  getRight() {
    return this.right;
  }

  setRight(right) {
    this.right = right;
  }

  getLeft() {
    return this.left;
  }

  setLeft(left) {
    this.left = left;
  }
}
