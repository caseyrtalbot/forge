---
name: advance
description: "Check gate conditions for the current phase and advance to the next phase if all pass. User-invoked only: do not auto-trigger."
disable-model-invocation: true
phase: any
gates:
  entry: "A Forge workflow is active in .forge/forge-state.json"
  exit: "Either the phase advances to the next phase, or gate failures are reported and the phase is unchanged"
---

# Advance

Evaluate all exit gate conditions for the current phase. If every gate passes, update `forge-state.json` to the next phase and invoke the next phase's skill. If any gate fails, report which gates failed and what evidence is missing. User-invoked only: phase advancement is an earned progression and must never be AI-triggered.

<HARD-GATE>
Never advance a phase on partial evidence. Every exit gate for the current phase must be satisfied before `forge-state.json` is mutated. If even one gate fails, leave state untouched and report the failures to the user.

Never fabricate or infer evidence that is not on disk. "The tests probably pass" is not evidence. The `.forge/evidence/<phase>/` directory is the source of truth.
</HARD-GATE>

## Usage

`/forge:advance`

## Process

1. Read `.forge/forge-state.json`. If no active workflow, report "No active Forge workflow" and exit.
2. Read the exit gate definitions for the current phase from the corresponding phase skill's frontmatter.
3. For each gate, check evidence in `.forge/evidence/<current-phase>/` and workflow state fields. Record PASS or FAIL per gate.
4. If any gate FAILS:
   a. Leave `forge-state.json` unchanged.
   b. Report every failing gate with the specific missing evidence.
   c. Suggest which skill the user should run to produce the missing evidence.
   d. Exit.
5. If all gates PASS:
   a. Move current phase into `completed_phases`.
   b. Set `phase` to the next phase in the sequence.
   c. Update `last_session` to now.
   d. Write the updated state.
   e. Invoke the next phase's skill.

## Phase Sequence

`discovery → design → planning → execution → verification → integration → (complete)`

## Evidence

- `.forge/forge-state.json` mutated only on successful advance.
- Session transcript shows per-gate PASS/FAIL rationale with evidence paths.

## Transitions

- **→ next phase skill**: All exit gates for the current phase have been satisfied.
- **← current phase skill** (no transition, report only): Any gate failed. State is unchanged.

## Anti-Patterns

- **Inferring gate pass from "feels done"**: Gates must be checked against files and state fields, not intuition.
- **Partial advancement**: There is no "advance but note the failure." Either all gates pass and the phase advances, or none do and the phase stays.
- **Silent gate failures**: Every failed gate must be reported with the specific missing evidence and a remediation suggestion.
