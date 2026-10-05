// Deterministic seeded PRNG (mulberry32) so mock data is identical on every load.
export function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private rand: () => number;
  constructor(seed: number) {
    this.rand = mulberry32(seed);
  }
  next() {
    return this.rand();
  }
  range(min: number, max: number) {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number) {
    return Math.floor(this.range(min, max + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
  bool(prob = 0.5) {
    return this.next() < prob;
  }
  gaussian(mean = 0, stdDev = 1) {
    const u1 = this.next() || 1e-9;
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  }
}

export const GLOBAL_SEED = 26249;
