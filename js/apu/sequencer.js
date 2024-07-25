/**
 * A Sequencer is a counter that counts down when it is enabled and clocked. When the counter reaches -1 a function
 * is invoked, and the counter is reset. What this function does varies depending on which channel it is invoked for.
 * Using a sequencer the frequency of a wave can be altered. The sequencer for a square wave channel sets the frequency of
 * the output waveform and it sets the duty cycle.
 *
 * The purpose of the sequencer is to output a '1' after a given interval.
 */
export class Sequencer {
  sequence = new Uint32Array(1);
  outputWaveForm = new Uint32Array(1);
  timer = new Uint16Array(1);
  reload = new Uint16Array(1);
  output = new Uint8Array(1);

  reloadTable = [0, 4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 1016, 2034, 4068];      // NTSC

  setReloadFromTable(index) {
    this.reload[0] = this.reloadTable[index];
  }

  decrementTimer() {
    this.timer[0]--;
  }

  setReloadValue(value) {
    this.reload[0] = value;
  }

  getReloadValue() {
    return this.reload[0];
  }

  getTimer() {
    return this.timer[0];
  }

  getOutput() {
    return this.output[0];
  }

  setOutput(value) {
    this.output[0] = value;
  }

  reloadTimer() {
    this.timer[0] = this.reload[0];
  }

  setOutputWaveForm(waveform) {
    this.outputWaveForm[0] = waveform;
  }

  setSequence(value = this.outputWaveForm[0]) {
    this.sequence[0] = value;
  }

  getSequence() {
    return this.sequence[0];
  }

  reset() {
    this.sequence[0] = 0x00000000;
    this.outputWaveForm[0] = 0x00000000;
    this.timer[0] = 0x0000;
    this.reload[0] = 0x0000;
    this.output[0] = 0x00;
  }
}
