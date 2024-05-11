/**
 * A Square wave (channels 1 and 2). $4002 and $4003 control the period of the wave. Periods are 11-bits long. $4002 holds
 * the low 8-bits and $4003 holds the high 3-bits of the period.
 * Once a waveform is generated it is associated with a length (how long is it played for) and it can also be swept (its
 * frequency can be changed in real time). If the frequency is fixed we get a continuous note (a beeeep sound). Both
 * length and frequency are controlled by dedicated hardware.
 *
 * SQ1_ENV ($4000)
 *
 *    76543210
 *    ||||||||
 *    ||||++++- Volume
 *    |||+----- Saw Envelope Disable (0: use internal counter for volume; 1: use Volume for volume)
 *    ||+------ Length Counter Disable (0: use Length Counter; 1: disable Length Counter)
 *    ++------- Duty Cycle
 *
 * Volume is 4 bits long so it can have a value from 0-F, where F is the loudest. Duty Cycle controls the tone.
 */
export class SquareWave {
  frequency = 0.0;
  dutyCycle = 0.0;
  amplitude = 1;
  pi = 3.14159;
  harmonics = 20;

  approxsin(t) {
    let j = t * 0.15915;
    j = j - Math.floor(j);
    return 20.785 * j * (j - 0.5) * (j - 1.0);
  };

  sample(t) {
    let a = 0.0;
    let b = 0.0;
    let p = this.dutyCycle * 2.0 * this.pi;

    for (let n = 1; n < this.harmonics; n++) {
      let c = n * this.frequency * 2.0 * this.pi * t;
      a += -this.approxsin(c) / n;
      b += -this.approxsin(c - p * n) / n;
    }

    return (2.0 * this.amplitude / this.pi) * (a - b);
  }
}
