const formatBytes = (byteLength: number): string =>
  `${byteLength} byte${byteLength === 1 ? "" : "s"}`;

export default formatBytes;
