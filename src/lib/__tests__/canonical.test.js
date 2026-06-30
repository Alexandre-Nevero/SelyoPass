import { describe, it, expect } from 'vitest';
import { canonicalize } from '../canonical.js';

describe('canonicalize', () => {
  it('is independent of object key insertion order', () => {
    const a = canonicalize({ b: 1, a: 2, c: { y: 1, x: 2 } });
    const b = canonicalize({ c: { x: 2, y: 1 }, a: 2, b: 1 });
    expect(a).toBe(b);
  });

  it('preserves array order (order is meaningful)', () => {
    expect(canonicalize([3, 1, 2])).toBe('[3,1,2]');
  });

  it('drops undefined values for stable output', () => {
    expect(canonicalize({ a: 1, b: undefined })).toBe('{"a":1}');
  });
});
