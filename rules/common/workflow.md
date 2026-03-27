# Forge Workflow

## Phase-Locked Development

Forge enforces a six-phase workflow: Discovery, Design, Planning, Execution, Verification, Integration. Each phase must complete before the next begins. Evidence gates prevent skipping phases.

## Phase Awareness

Before taking action, check the current workflow phase in `.forge/forge-state.json`. If a workflow is active:

- **Discovery/Design/Planning**: Do not write implementation code. Focus on refining the idea, creating the spec, or decomposing into tasks.
- **Execution**: Implement tasks from the plan. Follow test-first discipline. Review each task before marking complete.
- **Verification**: Run full test suite, build, and security scan. Collect evidence before claiming completion.
- **Integration**: Land the code via the user's chosen method (merge, PR, keep, discard).

## Skill Activation

Check for relevant Forge skills before starting work. The skill descriptions indicate when each should activate. When multiple skills could apply, use process skills first (discover-intent, trace-fault), then implementation skills (prove-first, drive-execution).

## State Management

Workflow state lives in `.forge/forge-state.json` in the project directory. This file:
- Tracks the current phase and completed phases
- Records evidence collected at each gate
- Persists across sessions (the session-capture hook updates it on exit)
- Should never be manually edited outside of Forge skills and hooks

## File Conventions

- Specs: `docs/forge/specs/YYYY-MM-DD-<topic>-design.md`
- Plans: `docs/forge/plans/YYYY-MM-DD-<topic>-plan.md`
- Evidence: `.forge/evidence/<phase>/<artifact>`
- State: `.forge/forge-state.json`
