# Forge Hook Architecture

## Hook Events Used

| Event | Hook | Purpose |
|-------|------|---------|
| SessionStart | session-init | Load workflow state, present status |
| PreToolUse (Write/Edit) | phase-gate | Prevent code edits during discovery/design/planning phases |
| PostToolUse (Bash) | evidence-collector | Capture test/build output as verification evidence |
| PreToolUse (Bash matching git commit) | commit-guardian | Validate verification has passed before commits |
| Stop | session-capture | Save workflow state for cross-session continuity |

## Execution Model

- All hooks are **synchronous** (async: false) to ensure they complete before the tool runs
- Exception: session-capture (Stop) is async since it runs after the session
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
- Exit codes: 0 = allow, 2 = block with message
- Hooks read `.forge/forge-state.json` from the current working directory for state
