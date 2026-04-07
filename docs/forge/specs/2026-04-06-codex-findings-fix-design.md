# Design Spec: Strengthen Enforcement + Fix Source-of-Truth Drift

**Workflow:** `codex-findings-fix-2026-04-06`
**Phase:** Design
**Date:** 2026-04-06
**Origin:** GPT-5.4 cold-read review of the Forge repository

---

## 1. Problem Statement

An independent code review (GPT-5.4 via Codex CLI) identified that Forge's documentation overclaims enforcement while the actual hook layer has integrity gaps. The most critical finding: the evidence system doesn't validate test success, only command execution. A failing `npm test` generates valid "evidence" that passes commit-guardian.

This spec strengthens the enforcement machinery to close the gaps, then aligns all documentation to accurately describe the stronger system.

---

## 2. Changes

### 2.1 Evidence Collector: Capture Exit Status (C1)

**File:** `scripts/hooks/evidence-collector.cjs`

**Current behavior:** Reads `toolResult.tool_response.stdout` and writes it unconditionally. Never checks exit code.

**New behavior:**
1. Extract exit code from `toolResult.tool_response.exit_code` (the field Claude Code provides in PostToolUse payloads)
2. Determine pass/fail: exit code 0 = PASS, non-zero = FAIL
3. Include a structured header in the evidence file:
   ```
   # Test Results
   Captured: 2026-04-06T14:30:00Z
   Command: npm test
   Exit Code: 0
   Status: PASS
   
   ## Output
   ...
   ```
4. The `Status:` line is the machine-readable field that commit-guardian will parse
5. Evidence files are ALWAYS written (even for failures) so the audit trail is complete. The status field distinguishes passing from failing evidence.

**Edge cases:**
- If `exit_code` field is absent from the payload (older Claude Code versions), default to `Status: UNKNOWN` and log a warning. Commit-guardian treats UNKNOWN as non-passing.
- Exit code extraction: check `toolResult.tool_response.exit_code`, fall back to `toolResult.tool_response.exitCode`, fall back to `toolResult.tool_response.returncode`

### 2.2 Commit Guardian: Validate Evidence Success (C1)

**File:** `scripts/hooks/commit-guardian.cjs`

**Current behavior (execution phase):** Checks if a `test-results-*` file exists and was modified within 30 minutes. Never reads contents.

**New behavior (execution phase):**
1. Find the most recent `test-results-*` file modified within 30 minutes
2. Read its contents and check for `Status: PASS`
3. If no file exists, or file is stale, or status is not PASS: deny with reason
4. Deny message distinguishes: "no evidence" vs "evidence exists but tests failed"

**Current behavior (verification phase):** Checks if test-results or build-results files exist. Never reads contents.

**New behavior (verification phase):**
1. Find the most recent `test-results-*` file. Read contents, require `Status: PASS`
2. Find the most recent `build-results-*` file. Read contents, require `Status: PASS`
3. Both must exist and pass. If either is missing or failed: deny with specific reason

**Parsing approach:** Simple line-by-line scan for `/^Status:\s*(PASS|FAIL|UNKNOWN)/`. No complex parsing needed.

### 2.3 Close MultiEdit Gap (I1)

**File:** `hooks/hooks.json`

**Change:** Line 17, update matcher from `"Write|Edit"` to `"Write|Edit|MultiEdit"`

**Impact:** phase-gate.cjs already handles the file path extraction correctly for both Write and Edit tool inputs. For MultiEdit, the input structure may differ (multiple file paths). The phase-gate script needs a minor update to handle MultiEdit's input shape.

**phase-gate.cjs update:** After parsing `toolInput`, also check `toolInput.tool_input?.edits` (MultiEdit sends an array of edits). If present, extract all `file_path` values and check each against the doc pattern exemptions. Block if ANY non-doc file is targeted.

### 2.4 Version Alignment (C2)

Update version to `2.0.0` in all files that currently say `1.0.0`:

| File | Current | Target |
|------|---------|--------|
| `package.json` line 3 | `1.0.0` | `2.0.0` |
| `.claude-plugin/marketplace.json` line 11 | `1.0.0` | `2.0.0` |
| `gemini-extension.json` line 4 | `1.0.0` | `2.0.0` |

Files already at `2.0.0` (no change needed): `.claude-plugin/plugin.json`, `README.md`, `STATE.md`

### 2.5 Skill Count Alignment (C2)

**Actual skill directories:** 12

| File | Current Claim | Fix |
|------|--------------|-----|
| `README.md` badge | 13 | Change to 12 |
| `README.md` "### 13 Skills" header | 13 | Change to 12 |
| `STATE.md` line 13 | "13 skills (3 discipline, 8 process, 2 utility)" | Change to "12 skills (3 discipline, 7 process, 2 utility)" |
| `docs/architecture.md` line 5 | "10 skills" | Change to "12 skills" |
| `docs/architecture.md` lines 16-25 | Lists only 10 | Add receive-feedback and isolate-work |

### 2.6 Agent Model Routing Alignment (C2)

**Actual state:** All 9 agents have `model: opus` in their frontmatter.

| File | Current Claim | Fix |
|------|--------------|-----|
| `docs/architecture.md` lines 101-104 | dependency-mapper and doc-synthesizer listed under sonnet | Move both to opus row, remove sonnet row |
| `docs/architecture.md` lines 33-35 | Comment says "(sonnet, read-only)" and "(sonnet, read+write)" | Change to "(opus, read-only)" and "(opus, read+write)" |

### 2.7 Remove Dangling Skill Reference (I2)

**File:** `agents/security-sentinel.md` line 7

**Change:** Remove `skills: ["authentication-security"]` line. No such skill exists.

### 2.8 Hook Documentation Alignment (I3)

**File:** `docs/hook-architecture.md` line 49

**Current:** `execution | Warn if no test evidence, but allow (per-task commits expected)`

**Fix:** After implementing 2.2, this becomes:
`execution | Block if no fresh passing test evidence (evidence must be <30 min old and Status: PASS)`

Also update the PreToolUse matcher description (line 8) to include MultiEdit after implementing 2.3.

### 2.9 Documentation Prose Corrections (D1-D3)

#### D1: Cross-session scope

**`docs/design-principles.md` line 150:**
- Current: "State survives across sessions, machines, and contributors."
- Fix: "State survives across sessions on the same machine. The `.forge/` directory is gitignored and does not transfer between machines or contributors."

**`docs/architecture.md` line 97:**
- Current: "This means state survives across sessions, machines, and contributors."
- Fix: "This means state survives across sessions on the same machine. `.forge/` is gitignored by design (it contains local workflow state, not project artifacts)."

#### D2: Review stages

**`docs/architecture.md` line 87-88:**
- Current: "Two-Stage Review: The quality-auditor checks spec compliance first, then code quality."
- Fix: "Three-Stage Review: The inspect-work skill reviews across three dimensions: spec compliance, code quality, then security. The quality-auditor agent handles the first two stages; the security-sentinel handles the third."

#### D3: Enforcement framing

**`docs/design-principles.md` line 149:**
- Current: "Forge locks EVERY transition."
- Fix: "Forge enforces critical transitions through hooks (phase-gate blocks code edits before a plan exists; commit-guardian blocks commits without passing test evidence) and guides the rest through deeply specified skill instructions with hard gates and anti-patterns."

**`README.md` paragraph at line ~30:**
- Review the "Rules are suggestions. Gates are enforcement." paragraph. Keep the framing but add honesty: specify which operations are hook-enforced vs skill-guided. The distinction is a feature (lightweight, composable) not a weakness.

**`docs/architecture.md` line 82:**
- Current implies all phases are hook-enforced. Clarify: "The phase-gate hook prevents code edits during Discovery, Design, and Planning phases. Phase transitions themselves are managed by skill instructions and the `/forge:advance` command, which checks gate conditions before progressing."

---

## 3. Files Modified

| File | Changes |
|------|---------|
| `scripts/hooks/evidence-collector.cjs` | Add exit code capture, Status field |
| `scripts/hooks/commit-guardian.cjs` | Parse evidence content for Status: PASS |
| `scripts/hooks/phase-gate.cjs` | Handle MultiEdit input shape |
| `hooks/hooks.json` | Add MultiEdit to matcher |
| `package.json` | Version 1.0.0 → 2.0.0 |
| `.claude-plugin/marketplace.json` | Version 1.0.0 → 2.0.0 |
| `gemini-extension.json` | Version 1.0.0 → 2.0.0 |
| `agents/security-sentinel.md` | Remove dangling skills reference |
| `README.md` | Fix skill count badge/header, review enforcement framing |
| `STATE.md` | Fix skill count |
| `docs/architecture.md` | Fix skill count, model routing, review stages, enforcement framing, cross-session scope |
| `docs/hook-architecture.md` | Fix commit-guardian behavior table, add MultiEdit to matcher description |
| `docs/design-principles.md` | Fix cross-session claim, enforcement framing |

**Total: 13 files**

---

## 4. What This Does NOT Change

- Hook architecture (still 5 hooks, same events, same graceful failure)
- Skill content or structure (skills are not modified)
- Agent definitions (except removing dangling ref from security-sentinel)
- Plugin manifest structure
- Test infrastructure (tests will be added/updated to cover new behavior)

---

## 5. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Exit code field name varies across Claude Code versions | Check multiple field names with fallback; UNKNOWN status treated as non-passing |
| MultiEdit input shape may differ from Write/Edit | Extract file paths from edits array; test with actual MultiEdit payloads |
| Breaking change if users rely on evidence files being written for failures | Evidence still written for failures (audit trail); only commit-guardian behavior changes |
| Strict evidence validation could block legitimate commits | 30-minute freshness window unchanged; clear deny messages explain what's needed |

---

## 6. Success Criteria

1. `npm test` with exit code 1 produces evidence file with `Status: FAIL`
2. `npm test` with exit code 0 produces evidence file with `Status: PASS`
3. Commit-guardian denies commits when most recent evidence has `Status: FAIL`
4. Commit-guardian allows commits when most recent evidence has `Status: PASS` and is fresh
5. Phase-gate blocks MultiEdit on code files during pre-execution phases
6. Phase-gate allows MultiEdit on doc/config files during any phase
7. All version numbers read `2.0.0` across all manifest files
8. All skill counts read `12` across all documentation
9. All model routing docs show all agents as opus
10. No dangling skill references exist
11. Cross-session docs accurately describe same-machine scope
12. Review docs say three-stage, not two-stage
13. Enforcement framing distinguishes hook-enforced vs skill-guided
14. All existing tests still pass
