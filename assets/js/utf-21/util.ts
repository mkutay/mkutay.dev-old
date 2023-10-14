const textEncoder = new TextEncoder();
export const getUtf8Bytes = textEncoder.encode.bind(textEncoder);

export function* getUtf16Bytes(str: string): Generator<number> {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    yield (charCode & 0xff00) >> 8;
    yield charCode & 0x00ff;
  }
}

export function* getUtf32Bytes(str: string): Generator<number> {
  for (const character of str) {
    const codepoint = character.codePointAt(0)!;
    yield (codepoint & 0xff000000) >> 24;
    yield (codepoint & 0x00ff0000) >> 16;
    yield (codepoint & 0x0000ff00) >> 8;
    yield codepoint & 0x000000ff;
  }
}
