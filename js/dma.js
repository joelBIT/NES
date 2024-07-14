/**
 * The 2A03 contains a pair of DMA units, one for copying sprite data to PPU OAM and the other for copying DPCM sample
 * data to the APU's DMC sample buffer. DMA is required for DPCM playback, and it is difficult to fill OAM without DMA.
 *
 * This is the DMA unit for copying sprite data to the PPU OAM.
 */
export class DMA {
  page = new Uint8Array(1);        // This together with dmaAddress form a 16-bit address on the CPU's address bus, dmaPage is the low byte
  address = new Uint8Array(1);
  data = new Uint8Array(1);        // Represents the byte of data in transit from the CPU's memory to the OAM
  transfer = false;
  dummy = true;

  getPage() {
    return this.page[0];
  }

  setPage(page) {
    this.page[0] = page;
  }

  getAddress() {
    return this.address[0];
  }

  setAddress(address) {
    this.address[0] = address;
  }

  incrementAddress() {
    this.address[0]++;
  }

  getData() {
    return this.data[0];
  }

  setData(data) {
    this.data[0] = data;
  }

  isTransfer() {
    return this.transfer;
  }

  setTransfer(value) {
    this.transfer = value;
  }

  isDummy() {
    return this.dummy;
  }

  setDummy(value) {
    this.dummy = value;
  }

  /**
   * If this wraps around (is equal to 0), we know that 256 bytes have been written, so end the dma transfer, and proceed as normal.
   *
   * @returns {boolean} true if wraps, false otherwise
   */
  isWrapping() {
    return this.address[0] === 0;
  }

  reset() {
    this.page = new Uint8Array(1);
    this.address = new Uint8Array(1);
    this.data = new Uint8Array(1);
    this.transfer = false;
    this.dummy = true;
  }
}
