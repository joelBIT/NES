/**
 * The 2A03 contains a pair of DMA units, one for copying sprite data to PPU OAM and the other for copying DPCM sample
 * data to the APU's DMC sample buffer. DMA is required for DPCM playback, and it is difficult to fill OAM without DMA.
 * The OAM DMA is the only effective method for initializing all 256 bytes of OAM. Because of the decay of OAM's dynamic
 * RAM when rendering is disabled, the initialization should take place within vblank. Writes through OAMDATA are
 * generally too slow for this task.
 *
 * This is the DMA (Direct Memory Access) unit for copying sprite data to the PPU OAM. OAM DMA copies 256 bytes from a
 * CPU page to PPU OAM via the OAMDATA ($2004) register. OAM DMA will copy from the page most recently written to $4014.
 */
export class DMA {
  page = new Uint8Array(1);        // This together with address form a 16-bit address on the CPU's address bus, address is the low byte
  address = new Uint8Array(1);
  data = new Uint8Array(1);        // Represents the byte of data in transit from the CPU's memory to the OAM
  transfer = false;                       // Indicates if a DMA transfer is ongoing
  dummy = true;                           // Used to wait one or two clock cycles (if necessary) before the DMA can start happening (due to clock synchronization)

  getPage() {
    return this.page[0];
  }

  getAddress() {
    return this.address[0];
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

  isDummy() {
    return this.dummy;
  }

  setDummy(value) {
    this.dummy = value;
  }

  /**
   * If this wraps around (is equal to 0), we know that 256 bytes have been written. Thus, the DMA transfer is finished.
   *
   * @returns {boolean} true if DMA transfer is finished, false otherwise
   */
  isWrapping() {
    return this.address[0] === 0;
  }

  endTransfer() {
    this.dummy = true;
    this.transfer = false;
  }

  /**
   * The page number (the high byte of the address) is written to OAMDMA ($4014). Writing $XX will upload 256 bytes of
   * data from CPU page $XX00–$XXFF to the internal PPU OAM.
   *
   * @param data  the page number
   */
  enableTransfer(data) {
    this.page[0] = data;
    this.address[0] = 0x00;
    this.transfer = true;
  }

  reset() {
    this.page[0] = 0x00;
    this.address[0] = 0x00;
    this.data[0] = 0x00;
    this.transfer = false;
    this.dummy = true;
  }
}
