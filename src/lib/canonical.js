// Deterministic JSON serialization so a credential signs and verifies to the
// same bytes regardless of key insertion order. Object keys are sorted
// recursively; array order is preserved (it is semantically meaningful).
export function canonicalize(value) {
  return JSON.stringify(sortValue(value));
}

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      const v = value[key];
      if (v === undefined) continue; // drop undefined for stable output
      sorted[key] = sortValue(v);
    }
    return sorted;
  }
  return value;
}
