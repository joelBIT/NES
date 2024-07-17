/**
 * Keeps count of how many clocks have passed. The system clock is incremented each time a bus clock() has
 * finished executing.
 */
export class SystemClock {
  systemClockCounter = new Uint32Array(1);

  /**
   * The CPU runs 3 times slower than the PPU, so we only call the CPU clock() every 3rd time the PPU clock() is invoked.
   *
   * @returns {boolean} true if the CPU should be clocked, false otherwise
   */
  isTimeToClockCPU() {
    return this.systemClockCounter[0] % 3 === 0;
  }

  /**
   * If it is an even CPU clock cycle, the bus should be read and the returned data stored in the DMA unit.
   *
   * @returns {boolean} true if the bus should be read (even clock cycle), false otherwise
   */
  isTimeToReadBus() {
    return this.systemClockCounter[0] % 2 === 0;
  }

  /**
   * If it is an odd CPU clock cycle, allow DMA transfer to take place on next even clock cycle so that the OAM can
   * be filled with data.
   *
   * @returns {boolean} true if next clock cycle will be even, false otherwise
   */
  isTimeToAllowDMA() {
    return this.systemClockCounter[0] % 2 === 1;
  }

  increment() {
    this.systemClockCounter[0]++;
  }

  reset() {
    this.systemClockCounter[0] = 0;
  }
}
