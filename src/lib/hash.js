// SHA-256 hashing via the Web Crypto API. Available in the browser and in
// Node 18+ (globalThis.crypto.subtle) — no external library, no paid service.
// F-003: documents are hashed locally; only the hash ever leaves the browser.

function subtle() {
  const c = globalThis.crypto;
  if (!c || !c.subtle) {
    throw new Error('Web Crypto (crypto.subtle) is not available in this environment.');
  }
  return c.subtle;
}

export function toUint8(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (typeof data === 'string') return new TextEncoder().encode(data);
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  throw new TypeError('Unsupported data type for hashing.');
}

// Returns the raw 32-byte SHA-256 digest as a Uint8Array.
export async function sha256Bytes(data) {
  const digest = await subtle().digest('SHA-256', toUint8(data));
  return new Uint8Array(digest);
}

// Returns the SHA-256 digest as a lowercase hex string (64 chars).
export async function sha256Hex(data) {
  const bytes = await sha256Bytes(data);
  return bytesToHex(bytes);
}

// Hashes a browser File/Blob by reading its bytes.
export async function hashFile(file) {
  const buf = await file.arrayBuffer();
  return sha256Hex(buf);
}

export function bytesToHex(bytes) {
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

export function hexToBytes(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0) {
    throw new Error('Invalid hex string.');
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
