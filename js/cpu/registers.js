/**
 * Facilitates the use of 8-bit addresses and values.
 */
export class Register8Bits {
  register = new DataView(new ArrayBuffer(1));

  get() {
    return this.register.getUint8(0);
  }

  set(value) {
    this.register.setUint8(0, value);
  }
}

/**
 * Facilitates the use of 16-bit addresses and values.
 */
export class Register16Bits {
  register = new DataView(new ArrayBuffer(2));

  get() {
    return this.register.getUint16(0);
  }

  set(value) {
    this.register.setUint16(0, value);
  }
}

