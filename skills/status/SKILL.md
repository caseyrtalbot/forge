---
name: status
description: "Show current Forge workflow phase, progress, and pending gates. User-invoked only: do not auto-trigger."
disable-model-invocation: true
phase: any
---

# Status

Show the current Forge workflow status including active phase, completed phases, evidence collected, task progress, and any blocking gate conditions. Read-only: this skill never mutates state. User-invoked only: do not auto-trigger.

## Usage

`/forge:status`

## Process

1. Read `.forge/forge-state.json`. If it does not exist, report "No active Forge workflow" and exit.
2. Display:
   - Current phase
   - Completed phases (in order)
   - Session count and created-at timestamp
   - Evidence files present in `.forge/evidence/` grouped by phase
3. If in the Execution phase, read the active plan file and show task progress (`N of M tasks complete`, with the current task highlighted).
4. Evaluate the exit gate conditions for the current phase and list any that are not yet met. These are the blockers for `/forge:advance`.

## Output Format

```
Forge workflow status
---------------------
Phase:              <current>
Completed:          <ordered list or "none">
Sessions:           <count>
Created:            <iso timestamp>

Evidence collected:
  <phase>: <file count> (<short list>)

Task progress (execution only):
  N of M tasks complete
  Active task: <task id and title>

Pending exit gates for <current phase>:
  - <gate condition 1>
  - <gate condition 2>
```

## Evidence

This skill produces no evidence. It is a read-only status report.

## Transitions

None. `status` always returns control to the user.
