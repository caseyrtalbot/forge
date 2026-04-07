# Forge Hook Architecture

## Hook Events Used

| Event | Hook | Purpose |
|-------|------|---------|
| SessionStart | session-init | Load workflow state, present status |
| PreToolUse (Write/Edit/MultiEdit) | phase-gate | Prevent code edits during discovery/design/planning phases |
| PostToolUse (Bash) | evidence-collector | Capture test/build output as verification evidence |
| PreToolUse (Bash matching git commit) | commit-guardian | Validate verification has passed before commits |
| SessionEnd | session-capture | Save workflow state for cross-session continuity |

## Execution Model

- All hooks are **synchronous** (async: false) to ensure they complete before the tool runs
- session-capture runs on SessionEnd (synchronous) to ensure state is written before the process exits
- All hooks have a **timeout of 15 seconds** (generous for file I/O operations)
- All hooks **exit 0 on error** with a warning logged to stderr (never block catastrophically)

## Runtime Profiles

Controlled by `FORGE_HOOK_PROFILE` environment variable:

| Profile | Hooks Active | Use Case |
|---------|-------------|----------|
| minimal | session-init, session-capture | Fast sessions, minimal overhead |
| standard | All 5 hooks | Default for structured development |
| strict | All 5 hooks (no difference from standard in v1) | Reserved for future stricter enforcement |

Default: `standard`

Disable specific hooks: `FORGE_DISABLED_HOOKS=phase-gate,commit-guardian`

## Script Requirements

- All scripts are Node.js (cross-platform: macOS, Linux, Windows)
- All paths use `${CLAUDE_PLUGIN_ROOT}` (no hardcoded paths)
- Stdin receives JSON payload with tool input details
- Exit codes: 0 = success (JSON stdout parsed for structured control), non-zero = error (stderr logged)
- Blocking hooks (phase-gate, commit-guardian) use `hookSpecificOutput.permissionDecision: "deny"` with exit 0
- Hooks read `.forge/forge-state.json` from the current working directory for state
- Phase-gate intercepts Write/Edit/MultiEdit tools. Bash commands that generate code files (scaffolding tools, code generators) are not gated. This is a deliberate tradeoff: gating Bash broadly would create false positives on routine commands.

## Commit Guardian Behavior by Phase

| Phase | Behavior |
|-------|----------|
| discovery, design, planning | Allow (commits are for docs/specs/plans) |
| execution | Block if no fresh passing test evidence (must be <30 min old and Status: PASS) |
| verification | Block if no test or build evidence exists |
| integration | Allow |
