#!/usr/bin/env python3
"""
idea-forge deterministic gate (schema v1.1.0).

The linter is the spine, not the AI. This script decides whether an idea.md is
allowed to freeze. Python standard library only -- no pip, no npm -- so it runs
anywhere python3 exists.

Usage:
    python3 validate.py idea.md
    python3 validate.py idea.md --override "reason logged into output"

Exit codes:
    0  all gates pass (eligible to freeze, or already a valid FROZEN brief)
    1  one or more gates failed
    2  usage / file error
"""

import argparse
import re
import sys

# ---------------------------------------------------------------------------
# Schema constants
# ---------------------------------------------------------------------------

# Each required section: canonical name + keywords that must all appear in the
# heading text (case-insensitive, leading number stripped).
REQUIRED_SECTIONS = [
    ("Problem statement", ["problem", "statement"]),
    ("Target segment", ["target", "segment"]),
    ("Evidence", ["evidence"]),
    ("Root cause", ["root", "cause"]),
    ("Market & alternatives", ["market", "alternative"]),
    ("Value proposition", ["value", "proposition"]),
    ("Feature set", ["feature", "set"]),
    ("Success metrics", ["success", "metric"]),
    ("Constraints, risks & kill criteria", ["kill", "criteria"]),
    ("Out of scope", ["out", "scope"]),
]

# Sections whose top-level *factual claim* bullets must carry evidence.
# Kill criteria are forward-looking fail-states, not empirical claims, so they
# are deliberately excluded from the evidence-or-[unverified] requirement.
CLAIM_SECTIONS = {"Evidence", "Market & alternatives"}

# Sections where a bare [unverified] without --override blocks FROZEN.
# Includes Kill criteria: an unverified fail-state must be acknowledged.
UNVERIFIED_GUARDED_SECTIONS = {"Evidence", "Market & alternatives",
                               "Constraints, risks & kill criteria"}

# Conservative solution-first scan for the Problem statement.
# Phrases first (low false-positive), then a few standalone tokens.
SOLUTION_PHRASES = [
    "our app", "our platform", "our solution", "our tool", "our product",
    "we will build", "we'll build", "we will create", "we plan to build",
    "ai-powered", "ai powered", "powered by ai", "machine learning",
    "mobile app", "web app", "saas platform", "the platform", "a dashboard",
    "rest api", "an api", "using ai", "built with", "tech stack",
    "micro-service", "microservice",
]
SOLUTION_TOKENS = [
    "saas", "api", "dashboard", "chatbot", "blockchain", "algorithm",
]

EVIDENCE_RE = re.compile(
    r"""^\s*>\s*\[!\s*evidence\s*\]   # > [!evidence]
        \s*type\s*:\s*(?P<type>said|did|paid)\s*\|
        \s*source\s*:\s*(?P<source>[^|]+?)\s*\|
        \s*date\s*:\s*(?P<date>\d{4}-\d{2}-\d{2})\s*$
    """,
    re.IGNORECASE | re.VERBOSE,
)

# Malformed evidence callout (starts like one but does not fully parse).
EVIDENCE_START_RE = re.compile(r"^\s*>\s*\[!\s*evidence", re.IGNORECASE)

TOP_BULLET_RE = re.compile(r"^(\s*)([-*]|\d+\.)\s+(?P<body>.+)$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(?P<title>.+?)\s*#*\s*$")
NA_RE = re.compile(r"^\s*N/A\s*[—\-:]+\s*because\s+\S", re.IGNORECASE)

VALID_STATUSES = ("DRAFT", "FROZEN", "REJECTED")


class Section:
    def __init__(self, canonical, title, start):
        self.canonical = canonical
        self.title = title
        self.start = start
        self.lines = []  # list of (lineno, text)


def normalize_heading(title):
    """Drop a leading number/punctuation so '1. Problem statement' matches."""
    return re.sub(r"^\s*\d+[.)]\s*", "", title).strip().lower()


def parse_sections(lines):
    """Return (header_lines, [Section]) split on H2 headings."""
    sections = []
    header = []
    current = None
    for i, raw in enumerate(lines):
        m = HEADING_RE.match(raw)
        if m and len(m.group(1)) == 2:  # H2 only
            title = m.group("title")
            canonical = match_canonical(title)
            current = Section(canonical or title.strip(), title.strip(), i)
            sections.append(current)
            continue
        if current is None:
            header.append((i, raw))
        else:
            current.lines.append((i, raw))
    return header, sections


def match_canonical(title):
    norm = normalize_heading(title)
    for canonical, keywords in REQUIRED_SECTIONS:
        if all(k in norm for k in keywords):
            return canonical
    return None


def section_is_na(section):
    for _, text in section.lines:
        if text.strip():
            return bool(NA_RE.match(text))
    return False  # empty body is not a valid N/A


def parse_frontmatter(lines):
    """Parse a leading YAML-ish frontmatter block delimited by '---'.

    Tolerant of leading blank lines. Only simple 'key: value' pairs are read
    (stdlib only -- no yaml dependency). Returns (dict, body_start_index).
    If there is no frontmatter, returns ({}, 0)."""
    start = 0
    while start < len(lines) and not lines[start].strip():
        start += 1
    if start >= len(lines) or lines[start].strip() != "---":
        return {}, 0
    fm = {}
    for i in range(start + 1, len(lines)):
        if lines[i].strip() == "---":
            return fm, i + 1
        m = re.match(r"^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$", lines[i])
        if m:
            value = m.group(2).strip().strip('"').strip("'")
            fm[m.group(1).strip().lower()] = value
    return {}, 0  # unterminated block -> treat as no frontmatter


def find_status(frontmatter, header_lines, all_lines):
    if frontmatter.get("status"):
        return frontmatter["status"].strip().upper()
    # fallback: tolerate a legacy inline "Status:" line anywhere
    pool = [t for _, t in header_lines] + all_lines
    for text in pool:
        m = re.match(r"^\s*Status\s*:\s*(?P<v>\w+)", text, re.IGNORECASE)
        if m:
            return m.group("v").upper()
    return None


# ---------------------------------------------------------------------------
# Gates
# ---------------------------------------------------------------------------

def gate_sections_present(sections, errors):
    found = {s.canonical for s in sections}
    for canonical, _ in REQUIRED_SECTIONS:
        if canonical not in found:
            errors.append(f"[sections] missing required section: '{canonical}'")


def gate_problem_purity(sections, errors):
    sec = next((s for s in sections if s.canonical == "Problem statement"), None)
    if sec is None or section_is_na(sec):
        return
    body = "\n".join(t for _, t in sec.lines)
    # ignore template placeholder lines wrapped in <...>
    body_clean = re.sub(r"<[^>]*>", "", body).lower()
    for phrase in SOLUTION_PHRASES:
        if phrase in body_clean:
            errors.append(
                f"[problem] §1 contains solution-first language: '{phrase}'")
    for tok in SOLUTION_TOKENS:
        if re.search(r"\b" + re.escape(tok) + r"\b", body_clean):
            errors.append(
                f"[problem] §1 contains solution-first term: '{tok}'")


def parse_evidence_at(section_lines, idx):
    """Scan the lines after a claim bullet for its evidence callout. The callout
    must appear before the next top-level bullet (a callout belongs to the
    nearest preceding claim). Continuation lines and sub-bullets are skipped.
    Returns (match, malformed_flag)."""
    for j in range(idx + 1, len(section_lines)):
        text = section_lines[j][1]
        if not text.strip():
            continue
        m = EVIDENCE_RE.match(text)
        if m:
            return m, False
        if EVIDENCE_START_RE.match(text):
            return None, True
        bm = TOP_BULLET_RE.match(text)
        if bm and len(bm.group(1)) == 0:
            # the next top-level claim begins; this claim has no callout
            return None, False
        # continuation prose or sub-bullet -> keep scanning within this claim
    return None, False


def gate_critical_claims(sections, override, errors):
    for sec in sections:
        guarded = sec.canonical in UNVERIFIED_GUARDED_SECTIONS
        claim_gated = sec.canonical in CLAIM_SECTIONS
        if (not guarded and not claim_gated) or section_is_na(sec):
            continue
        lines = sec.lines
        for k, (lineno, text) in enumerate(lines):
            stripped = text.strip()
            if "[unverified]" in stripped.lower():
                if guarded and not override:
                    errors.append(
                        f"[claims] line {lineno+1}: '[unverified]' in critical "
                        f"section '{sec.canonical}' requires --override")
                continue
            if not claim_gated:
                continue  # kill-criteria fail-states are not evidence-gated
            bm = TOP_BULLET_RE.match(text)
            if not bm or len(bm.group(1)) > 0:
                continue  # not a top-level bullet
            m, malformed = parse_evidence_at(lines, k)
            if malformed:
                errors.append(
                    f"[evidence] line {lineno+1}: malformed evidence callout "
                    f"near claim in '{sec.canonical}'")
            elif m is None and not override:
                snippet = bm.group("body")[:60]
                errors.append(
                    f"[claims] line {lineno+1}: untagged claim in "
                    f"'{sec.canonical}': '{snippet}' (add evidence callout or "
                    f"mark [unverified])")


def gate_evidence_floor(sections, errors):
    sec = next((s for s in sections if s.canonical == "Evidence"), None)
    if sec is None:
        return  # already reported by sections gate
    behavioral = []  # list of (type, source)
    has_paid = False
    malformed = 0
    for lineno, text in sec.lines:
        m = EVIDENCE_RE.match(text)
        if m:
            etype = m.group("type").lower()
            source = m.group("source").strip().lower()
            if etype in ("did", "paid"):
                behavioral.append((etype, source))
            if etype == "paid":
                has_paid = True
        elif EVIDENCE_START_RE.match(text):
            malformed += 1
            errors.append(
                f"[evidence] line {lineno+1}: malformed evidence callout")
    distinct_sources = {src for _, src in behavioral}
    if len(behavioral) < 3:
        errors.append(
            f"[floor] evidence floor not met: need >=3 behavioral (did/paid) "
            f"callouts, found {len(behavioral)}")
    if len(distinct_sources) < 3:
        errors.append(
            f"[floor] evidence floor not met: need >=3 distinct Source values "
            f"among behavioral items, found {len(distinct_sources)}")
    if not has_paid:
        errors.append(
            "[floor] evidence floor not met: need >=1 'paid' item "
            "(deposit, pre-order, paid pilot, or signed LOI)")


def gate_feature_ids(sections, errors):
    """§7 must carry at least one stable F-### feature ID. FMD's PRD/QA
    traceability references features by these IDs, so a brief with none gives
    the factory nothing to trace. (schema v1.1.0)"""
    sec = next((s for s in sections if s.canonical == "Feature set"), None)
    if sec is None or section_is_na(sec):
        return
    body = "\n".join(t for _, t in sec.lines)
    body_clean = re.sub(r"<[^>]*>", "", body)  # ignore <placeholders>
    if not re.search(r"\bF-\d{3,}\b", body_clean):
        errors.append(
            "[traceability] §7 Feature set has no F-### feature IDs; assign "
            "stable IDs (e.g. F-001) so FMD's PRD/QA can trace each feature")


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def gate_frontmatter(frontmatter, status, errors):
    if status is None:
        errors.append("[schema] missing 'status' (expected YAML frontmatter "
                      "with status: draft|frozen|rejected)")
    elif status not in VALID_STATUSES:
        errors.append(f"[schema] invalid status '{status}': must be "
                      f"draft, frozen, or rejected")
    # schema_version is FMD's compatibility pin; required to freeze.
    if status == "FROZEN" and not frontmatter.get("schema_version"):
        errors.append("[schema] a frozen brief must declare 'schema_version' "
                      "in YAML frontmatter (FMD pins compatibility to it)")


def validate(path, override_reason):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            lines = fh.read().splitlines()
    except OSError as exc:
        print(f"ERROR: cannot read {path}: {exc}", file=sys.stderr)
        return 2

    override = override_reason is not None
    errors = []
    frontmatter, _body_start = parse_frontmatter(lines)
    header, sections = parse_sections(lines)
    status = find_status(frontmatter, header, lines)

    gate_frontmatter(frontmatter, status, errors)
    gate_sections_present(sections, errors)
    gate_problem_purity(sections, errors)
    gate_critical_claims(sections, override, errors)
    gate_evidence_floor(sections, errors)  # never overridable
    gate_feature_ids(sections, errors)

    print(f"idea-forge linter v1.1.0  ::  {path}")
    if override:
        print(f"  OVERRIDE ACTIVE -- reason: {override_reason}")
    print(f"  status: {(status or 'MISSING').lower()}  "
          f"schema_version: {frontmatter.get('schema_version', 'MISSING')}")
    print("-" * 64)

    if errors:
        for e in errors:
            print(f"  FAIL  {e}")
        print("-" * 64)
        print(f"REJECT: {len(errors)} gate failure(s). Not eligible to freeze.")
        if status == "FROZEN":
            print("  WARNING: Status is FROZEN but gates fail -- invalid brief.")
        return 1

    print("  all gates passed")
    print("-" * 64)
    if status == "FROZEN":
        print("APPROVE: brief is FROZEN and valid.")
    else:
        print("ELIGIBLE: gates pass. Set 'Status: FROZEN' to freeze.")
    return 0


def main(argv):
    parser = argparse.ArgumentParser(
        description="idea-forge deterministic gate")
    parser.add_argument("file", help="path to idea.md")
    parser.add_argument(
        "--override", metavar="REASON",
        help="relax [unverified]/untagged-claim gates with a logged reason "
             "(evidence floor and section presence are never overridable)")
    args = parser.parse_args(argv)

    if args.override is not None and not args.override.strip():
        parser.error("--override requires a non-empty written reason")

    return validate(args.file, args.override)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
