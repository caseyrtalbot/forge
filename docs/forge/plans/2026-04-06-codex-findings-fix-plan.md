# Execution Plan: Strengthen Enforcement + Fix Source-of-Truth Drift

**Spec:** `docs/forge/specs/2026-04-06-codex-findings-fix-design.md`
**Date:** 2026-04-06

---

## Task Order

Tasks are ordered by dependency. Code changes first (they determine what the docs should say), then doc alignment.

---

### Task 1: Strengthen evidence-collector with exit code capture

**Files:** `scripts/hooks/evidence-collector.cjs`
**Spec section:** 2.1

**Changes:**
1. After line 33, extract exit code: check `toolResult.tool_response.exit_code`, then `exitCode`, then `returncode`. Default to `null` if absent.
2. Determine status: exit code 0 = `PASS`, non-zero = `FAIL`, null = `UNKNOWN`
3. Update the content template (lines 87-95) to include `Exit Code:` and `Status:` lines between `Command:` and `## Output`
4. Log the status in the stderr message (line 99): `[Forge] Evidence captured: ${filename} (${status})`

**Verification:**
- [ ] Evidence file from exit code 0 command contains `Status: PASS`
- [ ] Evidence file from exit code 1 command contains `Status: FAIL`
- [ ] Evidence file when exit code field is absent contains `Status: UNKNOWN`
- [ ] Existing test patterns still match and write evidence

---

### Task 2: Strengthen commit-guardian to validate evidence content

**Files:** `scripts/hooks/commit-guardian.cjs`
**Spec section:** 2.2
**Depends on:** Task 1 (evidence format)

**Changes:**
1. Add a helper function `evidencePasses(filePath)` that reads the file, scans for `/^Status:\s*PASS/m`, returns boolean
2. **Execution phase (lines 54-80):** Replace the current freshness-only check:
   - Find all `test-results-*` files modified within 30 minutes
   - For each, call `evidencePasses()`. Require at least one passing.
   - Deny messages: "no test evidence found" vs "test evidence found but tests failed (Status: FAIL)" vs "test evidence is stale (>30 min)"
3. **Verification phase (lines 82-109):** Replace file-existence check:
   - Find most recent `test-results-*`, require it exists AND passes
   - Find most recent `build-results-*`, require it exists AND passes
   - Deny messages specify which is missing/failing

**Verification:**
- [ ] Commit denied when most recent evidence has `Status: FAIL`
- [ ] Commit denied when most recent evidence has `Status: UNKNOWN`
- [ ] Commit allowed when most recent evidence has `Status: PASS` and is fresh
- [ ] Commit denied when no evidence exists (unchanged behavior)
- [ ] Verification phase requires both test AND build evidence to pass

---

### Task 3: Close MultiEdit gap in phase-gate

**Files:** `hooks/hooks.json`, `scripts/hooks/phase-gate.cjs`
**Spec section:** 2.3

**Changes to hooks.json:**
1. Line 17: Change `"Write|Edit"` to `"Write|Edit|MultiEdit"`

**Changes to phase-gate.cjs:**
1. After extracting `filePath` (line 33), add MultiEdit handling:
   - Check for `toolInput.tool_input?.edits` (array)
   - If present, extract all `file_path` values from the array
   - Check each path against docPatterns
   - If ANY path is a non-doc code file AND phase is blocked: deny
   - If all paths are doc files: allow
2. For single-file tools (Write/Edit), existing logic unchanged

**Verification:**
- [ ] MultiEdit targeting code files blocked during planning phase
- [ ] MultiEdit targeting only .md files allowed during planning phase
- [ ] MultiEdit targeting mix of code + doc files blocked during planning phase
- [ ] Write and Edit behavior unchanged
- [ ] All tools allowed during execution phase (unchanged)

---

### Task 4: Version alignment

**Files:** `package.json`, `.claude-plugin/marketplace.json`, `gemini-extension.json`
**Spec section:** 2.4

**Changes:**
1. `package.json` line 3: `"1.0.0"` → `"2.0.0"`
2. `.claude-plugin/marketplace.json` line 11: `"1.0.0"` → `"2.0.0"`
3. `gemini-extension.json` line 4: `"1.0.0"` → `"2.0.0"`

**Verification:**
- [ ] `grep -r '"1.0.0"' package.json .claude-plugin/marketplace.json gemini-extension.json` returns no results
- [ ] All three files show `"2.0.0"`

---

### Task 5: Remove dangling skill reference

**File:** `agents/security-sentinel.md`
**Spec section:** 2.7

**Change:** Remove `skills: ["authentication-security"]` line from frontmatter

**Verification:**
- [ ] `grep -r "authentication-security" agents/` returns no results

---

### Task 6: Fix skill count across docs

**Files:** `README.md`, `STATE.md`, `docs/architecture.md`
**Spec section:** 2.5

**Changes:**
1. `README.md`: Badge `skills-13-green` → `skills-12-green`
2. `README.md`: `### 13 Skills` → `### 12 Skills`
3. `STATE.md` line 13: `13 skills (3 discipline, 8 process, 2 utility)` → `12 skills (3 discipline, 7 process, 2 utility)`
4. `docs/architecture.md` line 5: `10 skills` → `12 skills`
5. `docs/architecture.md` plugin structure: add `receive-feedback/SKILL.md` and `isolate-work/SKILL.md` to the skills listing

**Verification:**
- [ ] `grep -rn "13 skills\|13 Skills\|skills-13" README.md STATE.md docs/` returns no results
- [ ] `grep -rn "10 skills\|10 Skills" docs/architecture.md` returns no results
- [ ] architecture.md plugin structure lists all 12 skills

---

### Task 7: Fix agent model routing docs

**File:** `docs/architecture.md`
**Spec section:** 2.6

**Changes:**
1. Lines 101-104: Remove sonnet row. Single row: all 9 agents under opus.
2. Lines 33-35: Change `(sonnet, read-only)` and `(sonnet, read+write)` to `(opus, read-only)` and `(opus, read+write)` for dependency-mapper and doc-synthesizer

**Verification:**
- [ ] `grep -i "sonnet" docs/architecture.md` returns no results

---

### Task 8: Fix hook documentation

**File:** `docs/hook-architecture.md`
**Spec section:** 2.8
**Depends on:** Tasks 2, 3

**Changes:**
1. Line 8: Add MultiEdit to the PreToolUse description: `PreToolUse (Write/Edit/MultiEdit)`
2. Line 49: Change execution behavior to `Block if no fresh passing test evidence (must be <30 min and Status: PASS)`
3. Line 42: Update the Bash code generation note to also mention MultiEdit coverage

**Verification:**
- [ ] Hook doc behavior table matches actual code behavior for all phases
- [ ] MultiEdit mentioned in event table

---

### Task 9: Fix enforcement framing and cross-session docs

**Files:** `docs/design-principles.md`, `docs/architecture.md`, `README.md`
**Spec section:** 2.9
**Depends on:** Tasks 1-3 (we need to know the final enforcement state)

**Changes to design-principles.md:**
1. Line 149: Replace "Forge locks EVERY transition" with honest framing per spec
2. Line 150: Replace "machines, and contributors" with same-machine scope per spec

**Changes to architecture.md:**
1. Line 82: Clarify which enforcement is hook-level vs skill-level
2. Line 87-88: "Two-Stage Review" → "Three-Stage Review" with description per spec
3. Line 97: Fix cross-session scope claim

**Changes to README.md:**
1. Line ~30 area: Review "Rules are suggestions. Gates are enforcement." paragraph. Keep the framing but distinguish hook-enforced operations from skill-guided workflow.

**Verification:**
- [ ] No doc claims "survives across machines and contributors"
- [ ] No doc claims "two-stage review" (should be three-stage)
- [ ] No doc claims "locks EVERY transition" without qualification
- [ ] Enforcement framing distinguishes hooks from skills

---

### Task 10: Run full test suite + validate

**Depends on:** All previous tasks

**Actions:**
1. Run `node tests/run-tests.cjs` - all existing tests must pass
2. Verify all 14 success criteria from the spec
3. Run `grep` checks for eliminated drift patterns

**Verification:**
- [ ] All existing tests pass
- [ ] No version `1.0.0` in manifest files
- [ ] No skill count of 13 or 10 in docs
- [ ] No "sonnet" in architecture.md
- [ ] No "authentication-security" in agents/
- [ ] No "machines and contributors" in docs
- [ ] No "two-stage" in architecture docs (should be three-stage)

---

## Execution Strategy

- **Tasks 1-3**: Sequential (2 depends on 1's format; 3 is independent but small)
- **Tasks 4-5**: Parallel (independent config/metadata fixes)
- **Tasks 6-7**: Parallel (independent doc fixes)
- **Task 8**: After tasks 2-3 (docs must reflect final code behavior)
- **Task 9**: After tasks 1-3 (framing must reflect final enforcement state)
- **Task 10**: After all (validation)

```
T1 (evidence-collector) → T2 (commit-guardian) → T8 (hook docs)
                                                ↗
T3 (phase-gate + hooks.json) ──────────────────
                                                ↘
T4 (versions) ─────────┐                        T9 (prose fixes)
T5 (dangling ref) ─────┤                        ↑
T6 (skill counts) ─────┤───→ T10 (validation)   │
T7 (model routing) ────┘                        ─┘
```
