# Forge State Schema

`.forge/forge-state.json` is the single source of truth for workflow state.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| workflow_id | string | Unique identifier for this workflow |
| current_phase | string | One of: discovery, design, planning, execution, verification, integration |
| phases_completed | string[] | Phases that have passed their exit gates |
| total_tasks | number | Total tasks in the plan (set during planning) |
| current_task | number | Index of the currently active task |
| tasks | object[] | Array of task objects with status fields |
| evidence | object | Map of phase to collected evidence paths |
| session_count | number | Number of sessions this workflow has spanned |
| last_session | string | ISO timestamp of the last session |
| created_at | string | ISO timestamp of workflow creation |

## Lifecycle

- Created by `/forge:start` using the initialization template
- Read by `session-init` hook at session start to inject context
- Read by `phase-gate` hook to enforce phase-appropriate tool access
- Read by `commit-guardian` hook to validate evidence before commits
- Updated by `evidence-collector` hook when test/build output is captured
- Updated by `session-capture` hook at session end (increments session_count, updates last_session)
- Updated by `/forge:advance` when phase transitions occur

## Valid Phases

Phases progress in order. A phase cannot be entered without completing its predecessor.

1. `discovery` -- understand what to build
2. `design` -- create spec documents
3. `planning` -- decompose into ordered tasks
4. `execution` -- implement tasks with test-first discipline
5. `verification` -- end-to-end validation
6. `integration` -- land changes, clean up
