import { defineConfig } from 'vitest/config';

// Unit tests target the pure logic in src/lib (schema, hashing, signing,
// verification, on-chain guard). They run in Node — no DOM, no network, no
// wallet — so the suite is deterministic and free to run anywhere.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    globals: false,
  },
});
