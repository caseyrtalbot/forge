---
name: audit
description: "Run comprehensive quality, security, and completeness audit on current work. User-invoked only: do not auto-trigger."
disable-model-invocation: true
phase: verification
---

# Audit

Run a comprehensive cross-cutting audit of the current workspace against the active plan. Dispatches three specialist agents in parallel (`quality-auditor`, `security-sentinel`, `integration-verifier`), compiles their findings into a single report, and writes the report to `.forge/evidence/verification/audit-report.md`. User-invoked only: do not auto-trigger.

`audit` is workspace-scale and complements `inspect-work`, which is per-task. Use `audit` when the user wants a single report that covers everything currently on the branch. Use `inspect-work` during per-task review in the Execution phase.

<HARD-GATE>
The audit report must show fresh results, not cached ones. Every agent must run against the current working tree. If any agent reports stale or missing input, re-dispatch it or escalate to the user. Never stitch a report together from partial evidence.
</HARD-GATE>

## Usage

`/forge:audit`

## Process

1. Read the active plan file and the current phase from `.forge/forge-state.json`.
2. Dispatch three agents in parallel:
   - `quality-auditor`: review all changed files against the plan's tasks and the spec.
   - `security-sentinel`: OWASP-aware vulnerability scan on the diff.
   - `integration-verifier`: run the full test suite and build; capture the output.
3. Wait for all three to return. If any returned BLOCKED or NEEDS_CONTEXT, resolve and re-dispatch.
4. Compile a single report with a PASS/FAIL verdict per category and a consolidated list of findings grouped by severity (Critical / Important / Suggestion).
5. Write the report to `.forge/evidence/verification/audit-report.md`.
6. Present the verdict and top findings to the user.

## Report Format

```
# Forge Audit Report — <iso timestamp>

## Verdicts
- Quality:     PASS | FAIL
- Security:    PASS | FAIL
- Integration: PASS | FAIL

## Critical
<items>

## Important
<items>

## Suggestions
<items>

## Evidence
- Quality findings: <path>
- Security findings: <path>
- Integration log:   <path>
```

## Evidence

- `.forge/evidence/verification/audit-report.md` exists and is fresh.
- The session transcript shows all three agent invocations and their raw outputs.

## Transitions

None. `audit` returns control to the user with a report. The user decides whether to fix findings, run `/forge:advance`, or take other action.

## Anti-Patterns

- **Sequential dispatch when parallel is possible**: Quality, security, and integration are independent. Dispatch in parallel.
- **Summarizing without a file**: The report must be written to disk. A chat-only summary is not evidence.
- **Rerunning without re-verifying**: If the user runs `/forge:audit` twice in one session, run the agents again. Do not reuse the prior report.
