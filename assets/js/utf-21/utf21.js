const get = (__byte, index) => (__byte & (1 << (7 - index)) ? 1 : 0);
const set = (__byte, index, value) => {
  const mask = 1 << (7 - index);
  return value ? __byte | mask : __byte & ~mask;
};
class Uint1Array {
  #bitLength;
  #bytes;
  constructor(bitLengthOrBuffer) {
    if (typeof bitLengthOrBuffer === "number") {
      const bitLength = bitLengthOrBuffer;
      this.#bitLength = bitLength;
      this.#bytes = new Uint8Array(Math.ceil(bitLength / 8));
    } else {
      const buffer = bitLengthOrBuffer;
      this.#bitLength = buffer.byteLength * 8;
      this.#bytes = new Uint8Array(buffer);
    }
  }
  get buffer() {
    return this.#bytes.buffer;
  }
  get(index) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    const __byte = this.#bytes[byteIndex];
    return get(__byte, bitIndex);
  }
  set(index, value) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    const oldByte = this.#bytes[byteIndex];
    const newByte = set(oldByte, bitIndex, value);
    this.#bytes[byteIndex] = newByte;
  }
  *[Symbol.iterator]() {
    for (let index = 0; index < this.#bitLength; index++) {
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      const __byte = this.#bytes[byteIndex];
      yield get(__byte, bitIndex);
    }
  }
}
const encode = (str) => {
  const characters = [...str];
  const codepoints = characters.map((c) => c.codePointAt(0));
  const bits = new Uint1Array(codepoints.length * 21);
  let bitIndex = 0;
  for (const codepoint of codepoints) {
    for (let i = 20; i >= 0; i--) {
      bits.set(bitIndex, codepoint & (2 ** i) ? 1 : 0);
      bitIndex++;
    }
  }
  const { buffer } = bits;
  return new Uint8Array(buffer);
};
const decode = (buffer) => {
  const bits = new Uint1Array(buffer);
  const codepointLength = Math.floor((buffer.byteLength * 8) / 21);
  const codepoints = [];
  for (
    let codepointIndex = 0;
    codepointIndex < codepointLength;
    codepointIndex++
  ) {
    const startBitIndex = codepointIndex * 21;
    let codepoint = 0;
    for (let i = 0; i < 21; i++) {
      const bit = bits.get(startBitIndex + i);
      codepoint += bit * 2 ** (20 - i);
    }
    codepoints.push(codepoint);
  }
  return String.fromCodePoint(...codepoints);
};
export { encode as encode };
export { decode as decode };
