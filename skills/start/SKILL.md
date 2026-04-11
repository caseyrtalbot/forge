---
name: start
description: "Initiate a new Forge workflow. Creates .forge/ state and begins the discovery phase. User-invoked only: do not auto-trigger."
disable-model-invocation: true
phase: any
transitions:
  - target: discover-intent
    condition: "Workflow state initialized successfully"
gates:
  entry: "User has explicitly requested to begin a new Forge workflow"
  exit: "`.forge/forge-state.json` exists and `discover-intent` has been activated"
---

# Start

Initiate a new Forge workflow. Check for existing workflow state in `.forge/`, create a new workflow if none exists, and hand off to `discover-intent` to begin collaborative refinement of what to build. User-invoked only: do not auto-trigger this skill.

## Usage

`/forge:start [description]`

The optional `[description]` is a short phrase describing what the user wants to build. It becomes the initial `intent` field in `forge-state.json` and seeds the first `discover-intent` question.

<HARD-GATE>
Never create or overwrite `.forge/forge-state.json` if an active workflow already exists. An "active workflow" means `completed_phases` does not include all six phases. Overwriting active state destroys accumulated evidence and phase history.

If an active workflow exists, ask the user whether to resume or archive the existing one. Never decide unilaterally.
</HARD-GATE>

## Process

1. Check `.forge/forge-state.json` for existing workflow state.
2. If an active workflow exists, show its current phase and progress, then ask the user whether to resume or archive.
3. If no workflow or user chose archive, create `.forge/` directory and write a fresh `forge-state.json` using the initialization template (`phase: discovery`, `completed_phases: []`, `created_at: <now>`).
4. Record the user's `[description]` argument (if provided) as the initial `intent`.
5. Invoke the `discover-intent` skill to begin Phase 1.

## Evidence

- `.forge/forge-state.json` exists with `phase: discovery` after this skill runs.
- `discover-intent` is the next active skill.

## Transitions

- **→ `discover-intent`**: Workflow state is initialized. Hand off to discovery phase.
