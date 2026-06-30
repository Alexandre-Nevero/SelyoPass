// F-001 — SEP-12-extended KYB credential schema for Philippine business
// documents. Extends the published SEP-9 `organization.*` fields (idea.md §5)
// with the PH document set idea.md §1/§7 names. The schema is conceptual
// (idea.md §9): field encodings here are SelyoPass's proposed v1.
//
// BR-005 — the schema MUST carry current UBO (ultimate-beneficial-owner) fields
// to stay aligned with SEC Memorandum Circular No. 15, s.2025.

export const SCHEMA_ID = 'selyopass.kyb.ph.v1';
export const SCHEMA_EXTENDS = 'SEP-9/SEP-12 organization.*';
export const JURISDICTION = 'PH';

// SEP-9 organization.* fields carried by every credential.
export const ORGANIZATION_FIELDS = [
  { key: 'name', label: 'Registered company name', pii: true },
  { key: 'registration_number', label: 'SEC registration number', pii: true },
  { key: 'registration_date', label: 'Date of registration', pii: false },
  { key: 'director_name', label: 'Director name', pii: true },
  { key: 'shareholder_name', label: 'Shareholder name', pii: true },
];

// F-001 PH document set. Each is supplied off-chain and hashed locally (F-003);
// only the hash is carried in the credential and anchored on-chain (BR-002).
export const PH_DOCUMENT_TYPES = [
  { key: 'sec_registration', label: 'SEC Registration' },
  { key: 'bir_certificate', label: 'BIR Certificate' },
  { key: 'mayors_permit', label: "Mayor's Permit" },
  { key: 'articles_of_incorporation', label: 'Articles of Incorporation' },
  { key: 'general_information_sheet', label: 'General Information Sheet (GIS)' },
];

const HEX64 = /^[0-9a-f]{64}$/;

// Validates a credential payload (the object before signing). Returns
// { valid, errors } where errors is a list of { field, message }. A missing or
// malformed required field produces a specific field-level error (F-001
// acceptance; TC-002), including the UBO fields (BR-005; TC-003).
export function validateCredential(credential) {
  const errors = [];
  const c = credential || {};

  if (c.schema !== SCHEMA_ID) {
    errors.push({ field: 'schema', message: `schema must be "${SCHEMA_ID}"` });
  }
  if (c.jurisdiction !== JURISDICTION) {
    errors.push({ field: 'jurisdiction', message: `jurisdiction must be "${JURISDICTION}"` });
  }

  // SEP-9 organization.* fields
  const org = c.organization || {};
  for (const f of ORGANIZATION_FIELDS) {
    if (!isNonEmptyString(org[f.key])) {
      errors.push({ field: `organization.${f.key}`, message: `${f.label} is required` });
    }
  }

  // F-001 PH document hashes — one valid SHA-256 hex per required document.
  const hashes = c.document_hashes || {};
  for (const d of PH_DOCUMENT_TYPES) {
    const h = hashes[d.key];
    if (h === undefined || h === null || h === '') {
      errors.push({ field: `document_hashes.${d.key}`, message: `${d.label} document is required` });
    } else if (typeof h !== 'string' || !HEX64.test(h)) {
      errors.push({
        field: `document_hashes.${d.key}`,
        message: `${d.label} hash must be a 64-char SHA-256 hex string`,
      });
    }
  }

  // BR-005 — UBO / beneficial ownership disclosure (SEC MC No. 15 s.2025).
  const owners = c.beneficial_owners;
  if (!Array.isArray(owners) || owners.length === 0) {
    errors.push({
      field: 'beneficial_owners',
      message: 'at least one beneficial owner (UBO) is required (SEC MC No. 15 s.2025)',
    });
  } else {
    owners.forEach((o, i) => {
      if (!o || !isNonEmptyString(o.name)) {
        errors.push({ field: `beneficial_owners[${i}].name`, message: 'beneficial owner name is required' });
      }
      const pct = o ? Number(o.ownership_percentage) : NaN;
      if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
        errors.push({
          field: `beneficial_owners[${i}].ownership_percentage`,
          message: 'ownership percentage must be a number between 0 and 100',
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
