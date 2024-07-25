/**
 * The NES APU's delta modulation channel (DMC) can output 1-bit delta-encoded samples or can have its 7-bit counter
 * directly loaded, allowing flexible manual sample playback. The DMC plays samples while the other channels play
 * waveforms. The DMC's IRQ can be used as an IRQ-based timer when the mapper used does not have one available.
 *
 *
 *                            Timer
 *                              |
 *                              v
 *  Reader ---> Buffer ---> Shifter ---> Output level ---> (to the mixer)
 *
 *
 *  The rate determines for how many CPU cycles happen between changes in the output level during automatic
 *  delta-encoded sample playback. Automatic 1-bit delta-encoded sample playback is carried out by a combination of
 *  three units. The memory reader fills the 8-bit sample buffer whenever it is emptied by the sample output unit.
 *  The sample buffer either holds a single 8-bit sample byte or is empty. It is filled by the reader and can only be
 *  emptied by the output unit; once loaded with a sample byte it will be played back.
 *
 */
export class DeltaModulationChannel {
  rateTable = [428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54];      // NTSC, contains CPU cycles
  irqEnabled = false;
  interrupt = false;
  enabled = false;
  loop = false;
  silent = false;
  rate = 0;     // corresponds to CPU cycles
  index = 0;    // index to the rateTable
  output = 0.0;
  sampleAddress = new Uint16Array(1);
  sampleLength = new Uint16Array(1);
  bytesRemaining = new Uint16Array(1);   // // bytes remaining in the sample
  sampleBuffer = new Uint8Array(1);
  nextSampleAddress = new Uint16Array(1);
  LEVEL_CONVERSION = 10;      // Convert output level before it is used in the mixer

  allSamples;

  // Output unit
  shiftRegister = new Uint8Array(1);
  bitsRemaining = 0;

  setIrqEnabled(enabled) {
    this.irqEnabled = enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setLoop(loop) {
    this.loop = loop;
  }

  setRateIndex(index) {
    this.index = index;
  }

  /**
   * Can be used to play PCM samples directly by setting the counter value at a high frequency. A high value in the
   * PCM counter reduces the volume of the triangle and noise channels.
   *
   * @param value     the output value to the mixer
   */
  setLoadCounter(value) {
    this.output = value;
  }

  /**
   * Sample address = %11AAAAAA.AA000000 = $C000 + (A * 64)
   * A lot of the samples are already collected when booting the emulator so it is only the index to the array containing
   * all these samples that are of interest. That is why $C000 is left out in this method.
   *
   * @param address     the address byte AAAA.AAAA (bits 7-0), which is the index for a sample in the allSamples array
   */
  setSampleAddress(address) {
    this.sampleAddress[0] = address << 6;        // (address << 6)  is the index into the allSamples array
  }

  /**
   * When booting the emulator all samples between $C000 - $FFFF in memory are stored here so that the DMC does not need
   * to communicate with the other parts of the emulator in order to retrieve samples. The DMC only needs to index the
   * allSamples array to retrieve desired samples.
   *
   * @param samples     array containing all samples between $C000 - $FFFF in memory
   */
  setAllSamples(samples) {
    this.allSamples = samples;
  }

  /**
   * Sample length = %LLLL.LLLL0001 = (L * 16) + 1 bytes
   *
   * @param length      the length byte LLLL.LLLL (bits 7-0)
   */
  setSampleLength(length) {
    this.sampleLength[0] = (length << 4) + 1;
  }

  getOutput() {
    return this.output !== 0 ? this.output/this.LEVEL_CONVERSION : this.output;
  }

  isEnabled() {
    return this.enabled;
  }

  clearInterrupt() {
    this.interrupt = false;
  }

  clearBytesRemaining() {
    this.bytesRemaining[0] = 0x00;
  }

  hasBytesRemaining() {
    return this.bytesRemaining[0] !== 0;
  }

  setBytesRemaining() {
    this.bytesRemaining[0] = this.sampleLength[0];
  }

  setNextSampleAddress() {
    this.nextSampleAddress[0] = this.sampleAddress[0];
  }

  clock() {
    if (this.enabled) {
      this.clockMemoryReader();
      this.clockOutputUnit();
    }
  }

  /**
   * When the sample buffer is emptied, the memory reader fills the sample buffer with the next byte from the currently
   * playing sample. It has an address counter and a bytes remaining counter.
   *
   * When a sample is (re)started, the current address is set to the sample address, and bytes remaining is set to the
   * sample length.
   *
   * Any time the sample buffer is in an empty state and bytes remaining is not zero (including just after a write
   * to $4015 that enables the channel, regardless of where that write occurs relative to the bit counter mentioned
   * below), the following occur:
   * - The sample buffer is filled with the next sample byte read from the allSamples array using the nextSampleAddress
   *   as an index into the allSamples array.
   * - The nextSampleAddress is incremented; if it exceeds $FFFF, it is wrapped around to $8000.
   * - The bytesRemaining counter is decremented; if it becomes zero and the loop flag is set, the sample is restarted;
   *   otherwise, if the bytesRemaining counter becomes zero and the IRQ enabled flag is set, the interrupt flag is set.
   * - At any time, if the interrupt flag is set, the CPU's IRQ line is continuously asserted until the interrupt flag is
   *   cleared.
   */
  clockMemoryReader() {
    if (this.sampleBuffer[0] === 0 && this.bytesRemaining[0] !== 0) {
        this.sampleBuffer[0] = this.allSamples[this.nextSampleAddress[0]];
      if (this.nextSampleAddress[0] === 0xFFFF) {
        this.nextSampleAddress[0] = 0x8000;
      } else {
        this.nextSampleAddress[0]++;
      }
      this.bytesRemaining[0]--;
      if (this.bytesRemaining[0] === 0 && this.loop) {
        this.setNextSampleAddress();
        this.setBytesRemaining();
      }
      if (this.bytesRemaining[0] === 0 && this.irqEnabled) {
        this.interrupt = true;
      }
    }
  }

  /**
   * The following happens:
   * - If the 'silent' flag is set, the output level changes based on bit 0 of the shift register.
   * - If the bit is 1, add 2; otherwise, subtract 2. But if adding or subtracting 2 would cause the output level to
   *   leave the 0-127 range, leave the output level unchanged. This means subtract 2 only if the current level is at
   *   least 2, or add 2 only if the current level is at most 125.
   * - The shiftRegister is clocked (right shift 1 step).
   * - The bitsRemaining counter is decremented. If it becomes zero, a new output cycle is started.
   */
  clockOutputUnit() {
    if (this.rate > 0) {
      this.rate -= 2;     // -2 is used because there are 2 CPU cycles per APU cycle, and 'rate' corresponds to CPU cycles
    }
    if (this.rate <= 0) {
      this.rate = this.rateTable[this.index];
      if (!this.silent) {
        const bit0 = this.shiftRegister[0] & 0x01;
        if (bit0 === 0 && this.output >= 2) {
          this.output -= 2;
        } else if (bit0 === 1 && this.output <= 125) {
          this.output += 2;
        }
      } else {
        this.output = 0.0;
      }
      this.shiftRegister[0] >>= 1;
      if (this.bitsRemaining > 0) {
        this.bitsRemaining -= 1;
      }

      // When an output cycle ends, a new cycle is started as follows:
      // The bits-remaining counter is loaded with 8.
      // If the sample buffer is empty, then the 'silent' flag is cleared; otherwise, the 'silent' flag is set and the sampleBuffer is emptied into the shiftRegister.
      if (this.bitsRemaining === 0) {
        this.bitsRemaining = 8;
        if (this.sampleBuffer[0] === 0x00) {
          this.silent = true;
        } else {
          this.silent = false;
          this.shiftRegister[0] = this.sampleBuffer[0];
          this.sampleBuffer[0] = 0x00;
        }
      }
    }
  }

  reset() {
    this.irqEnabled = false;
    this.interrupt = false;
    this.enabled = false;
    this.loop = false;
    this.silent = false;
    this.rate = 0;
    this.index = 0;
    this.output = 0.0;
    this.sampleAddress[0] = 0x0000;
    this.sampleLength[0] = 0x0000;
    this.bytesRemaining[0] = 0x0000;
    this.sampleBuffer[0] = 0x00;
    this.nextSampleAddress[0] = 0x0000;
    this.shiftRegister[0] = 0x00;
    this.bitsRemaining = 0;
  }
}
