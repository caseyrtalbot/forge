```
    ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
    ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
    █████╗  ██║   ██║██████╔╝██║  ███╗█████╗
    ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
    ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
    ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
         Casey's Claude Code Workflow
```

Phase-locked development workflow for Claude Code. Enforces earned progression through discovery, design, planning, execution, verification, and integration with evidence gates at every transition.

## What It Does

Forge treats software construction as a series of earned progressions. Each phase of work must produce demonstrable evidence before the next phase unlocks. The agent cannot skip steps, cut corners, or claim completion without proof.

## Why Forge Instead of Rules

You can write rules in CLAUDE.md that say "write tests first" and "review code before committing." But rules are suggestions. The agent reads them, agrees with them, and then skips them when it feels confident. Forge enforces workflow through hooks that intercept tool use (the `phase-gate` hook blocks code edits during pre-execution phases by reading `.forge/forge-state.json`; the `commit-guardian` hook requires test evidence before commits), skills that document the expected workflow graph and gate conditions for the agent to follow, and state tracking that persists across sessions. The difference between a rule and Forge is the difference between a suggestion and a gate.

## Prerequisites

- **Claude Code** (v1.0.33 or later)
- **Node.js** (v18 or later) -- required for hook scripts
- **Git** -- required for version control workflows

## Quick Start

### Install

```bash
# From the Claude Code plugin marketplace (when published)
/plugin marketplace add caseyrtalbot/forge
/plugin install forge@caseyrtalbot
```

Or install from a local clone:

```bash
git clone https://github.com/caseyrtalbot/forge.git
/plugin install ./forge
```

### First Use

```bash
# Start a new workflow
/forge:start "Add user authentication"

# Check where you are
/forge:status

# Advance to next phase (checks gates)
/forge:advance

# Run a full audit
/forge:audit
```

### What to Expect

After `/forge:start`, the agent enters the Discovery phase. It reads your project context, then asks you questions one at a time to understand what you want to build. Once you approve a direction, it moves to Design and creates a spec document for your review. After you approve the spec, it decomposes it into tasks with verification criteria, then executes them one by one with test-first discipline and per-task review. Finally, it runs verification checks (tests, build, security) and presents you with options to merge, create a PR, or keep the branch. The entire workflow is tracked in `.forge/forge-state.json` and survives across sessions.

## The Workflow

```
Discovery --> Design --> Planning --> Execution --> Verification --> Integration
```

| Phase | Skill | What Happens |
|-------|-------|-------------|
| **Discovery** | `discover-intent` | Collaborative refinement of what to build |
| **Design** | `shape-design` | Spec document with architecture, data flow, edge cases |
| **Planning** | `chart-tasks` | Ordered tasks with verification criteria |
| **Execution** | `drive-execution` + `prove-first` | Task-by-task implementation with test-first discipline |
| **Verification** | `inspect-work` + `confirm-complete` | Three-stage review and evidence-based completion |
| **Integration** | `land-changes` | Merge, PR, or keep with user consent |

Two additional skills work across all phases:
- **`trace-fault`** -- systematic debugging with hypothesis tracking
- **`distill-lessons`** -- workflow retrospective (runs at completion)

## What's Inside

### 10 Skills

| Skill | Phase | Purpose |
|-------|-------|---------|
| `discover-intent` | Discovery | Refine what to build through structured dialogue |
| `shape-design` | Design | Create spec with self-review and user approval |
| `chart-tasks` | Planning | Decompose spec into verified tasks |
| `drive-execution` | Execution | Orchestrate fresh-agent-per-task implementation |
| `prove-first` | Execution | Test-first development discipline |
| `inspect-work` | Verification | Three-stage review: spec, quality, security |
| `confirm-complete` | Verification | Evidence-based completion checking |
| `land-changes` | Integration | Merge/PR with user consent |
| `trace-fault` | Any | Hypothesis-driven debugging |
| `distill-lessons` | Any | Workflow retrospective |

### 9 Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `spec-analyst` | opus | Validate specs for completeness and contradictions |
| `task-decomposer` | opus | Break specs into executable tasks |
| `implementer` | opus | Execute single tasks with test-first discipline |
| `quality-auditor` | opus | Two-stage review: spec compliance + code quality |
| `security-sentinel` | opus | OWASP-aware vulnerability scanning |
| `test-strategist` | opus | Determine test needs and audit coverage |
| `dependency-mapper` | sonnet | Trace change impact across codebase |
| `integration-verifier` | opus | Run full test suite and build checks |
| `doc-synthesizer` | sonnet | Keep docs in sync with code changes |

### 5 Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `session-init` | SessionStart | Load workflow state, show status |
| `phase-gate` | PreToolUse (Write/Edit) | Block code edits during pre-execution phases |
| `evidence-collector` | PostToolUse (Bash) | Capture test/build output as evidence |
| `commit-guardian` | PreToolUse (Bash) | Validate verification before commits |
| `session-capture` | SessionEnd | Save state for cross-session continuity |

### 4 Commands

| Command | Purpose |
|---------|---------|
| `/forge:start` | Initiate a new workflow |
| `/forge:status` | Show current phase and progress |
| `/forge:advance` | Check gates and progress to next phase |
| `/forge:audit` | Run quality, security, and completeness audit |

## Hook Runtime Profiles

Control hook strictness via environment variable:

```bash
# Minimal: only session lifecycle hooks
export FORGE_HOOK_PROFILE=minimal

# Standard: all hooks (default)
export FORGE_HOOK_PROFILE=standard

# Disable specific hooks
export FORGE_DISABLED_HOOKS=phase-gate,commit-guardian
```

## Platform Support

| Platform | Support Level |
|----------|-------------|
| **Claude Code** | Full (primary target) |
| **Codex CLI** | Partial (agents via AGENTS.md) |
| **Gemini CLI** | Partial (extension manifest) |

## Philosophy

- **Earned Progression** -- every phase transition requires evidence
- **Transparent State** -- workflow progress is always visible and queryable
- **Scope Discipline** -- focused workflow, nothing extraneous
- **Depth Over Breadth** -- 10 deep skills, not 100 shallow ones
- **Agent Autonomy With Boundaries** -- capable agents with restricted scope
- **Composable Without Coupling** -- skills work alone or as a pipeline
- **Verification Is Not Optional** -- evidence before assertions, always

## Contributing

1. Fork the repository
2. Create a branch for your change
3. Follow the existing skill/agent format
4. Submit a PR with a description of what you changed and why

## License

MIT
