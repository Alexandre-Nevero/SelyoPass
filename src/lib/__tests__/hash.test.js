import { describe, it, expect } from 'vitest';
import { sha256Hex, bytesToHex, hexToBytes } from '../hash.js';

describe('sha256Hex', () => {
  it('matches the known SHA-256 test vector for "abc"', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('produces a 64-char hex string', async () => {
    const h = await sha256Hex('SYNTHETIC');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when one byte changes (F-003 tamper detection)', async () => {
    const a = await sha256Hex('document-v1');
    const b = await sha256Hex('document-v2');
    expect(a).not.toBe(b);
  });
});

describe('hex helpers', () => {
  it('round-trips bytes <-> hex', () => {
    const bytes = new Uint8Array([0, 1, 254, 255]);
    expect(hexToBytes(bytesToHex(bytes))).toEqual(bytes);
  });
});
