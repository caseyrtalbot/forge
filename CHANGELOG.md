# Changelog

## 2.1.0 - 2026-04-11

### Changed
- Migrated all four slash commands from `commands/` to `skills/` so they share the same frontmatter surface as the rest of the plugin (phase, gates, transitions, `disable-model-invocation`). The `commands/` directory has been removed.
  - `/forge:start`, `/forge:status`, `/forge:advance`, `/forge:audit` are now user-invoked skills in Tier 3, alongside `/forge:isolate-work`.
  - All four carry `disable-model-invocation: true`. The model must not auto-trigger them — phase advancement, status checks, workflow start, and cross-cutting audits are user decisions.
  - User-facing invocation is unchanged: `/forge:<name>` still works the same way.
- Tier 3 section in `CLAUDE.md` and `README.md` now lists all five user-invoked skills.
- `README.md` skill count badge updated from 12 to 16.
- `docs/architecture.md` tree diagram no longer references the removed `commands/` directory.
- `CONTRIBUTING.md` "Adding a Command" section removed; Tier 3 skills are added the same way as any other skill.

### Why
The four commands sat outside the rest of the plugin's skill architecture: they could not declare `phase`, `transitions`, `gates`, or `disable-model-invocation`, and because of that the model could be tempted to fire `/forge:advance` or `/forge:audit` on its own judgment. Moving them into `skills/` with `disable-model-invocation: true` closes that gap and makes the whole plugin uniformly skill-based.

## 2.0.1 - 2026-04-04

### Enhanced
- commit-guardian: now blocks during execution phase without fresh test evidence (was warn-only)
- Evidence freshness: test results older than 30 minutes are treated as stale
- Per-task enforcement: since drive-execution requires per-task commits, blocking stale commits effectively enforces per-task testing

## 2.0.0 - 2026-04-04

### Consolidated
- Absorbed uniquely valuable content from superpowers plugin
- prove-first: Iron Law, rationalization resistance, red flags, verification checklist
- trace-fault: Architecture questioning escalation, defense-in-depth, condition-based-waiting, parallel investigation techniques
- confirm-complete: Common failures table, fresh-execution requirement, honesty framing
- inspect-work: Re-review loop with fix-and-verify cycles, reviewer prompt templates
- chart-tasks: Forbidden placeholders, atomic step granularity (2-5 min)
- drive-execution: Implementer status handling (DONE/CONCERNS/CONTEXT/BLOCKED), parallel dispatch guidance
- discover-intent: Visual companion concept (infrastructure deferred)

### Added
- `receive-feedback` skill: Code review receiving framework with pushback protocol
- `isolate-work` skill: Git worktree management with safety verification (user-invoked only)
- Supporting reference files for prove-first, trace-fault, inspect-work, chart-tasks
- Dynamic skill routing in CLAUDE.md (three-tier system replaces superpowers' 1% rule)
- Implementer status reporting, escalation protocol, and self-review checklist

### Fixed
- Removed dangling superpowers references in implementer.md and quality-auditor.md

### Removed
- Dependency on superpowers plugin (all valuable content now in forge)

## 1.0.0

Initial release of Forge.

### Skills (10)
- `discover-intent` -- collaborative refinement of what to build
- `shape-design` -- spec creation with spec-analyst review and user approval
- `chart-tasks` -- task decomposition with verification criteria
- `drive-execution` -- fresh-agent-per-task orchestration with dependency mapping
- `prove-first` -- test-first development discipline
- `inspect-work` -- three-stage review (spec compliance, code quality, security)
- `confirm-complete` -- evidence-based completion with test, build, security, performance, and spec coverage checks
- `land-changes` -- merge/PR with user consent and documentation sync
- `trace-fault` -- hypothesis-driven debugging with tracking
- `distill-lessons` -- workflow retrospective

### Agents (9)
- `spec-analyst` -- validates specs for completeness and contradictions
- `task-decomposer` -- breaks specs into executable tasks
- `implementer` -- executes single tasks with test-first discipline
- `quality-auditor` -- two-stage code review
- `security-sentinel` -- OWASP-aware vulnerability scanning
- `test-strategist` -- test coverage auditing
- `dependency-mapper` -- change impact analysis
- `integration-verifier` -- full test suite and build verification
- `doc-synthesizer` -- documentation sync

### Hooks (5)
- `session-init` -- loads workflow state on session start
- `phase-gate` -- blocks code edits during pre-execution phases
- `evidence-collector` -- captures test/build output as evidence
- `commit-guardian` -- validates verification before git commits
- `session-capture` -- saves state for cross-session continuity

### Commands (4)
- `/forge:start` -- initiate a new workflow
- `/forge:status` -- show current phase and progress
- `/forge:advance` -- check gates and advance to next phase
- `/forge:audit` -- run quality, security, and completeness audit

### Infrastructure
- Phase-locked workflow state machine with evidence gates
- Project-local state tracking in `.forge/` directory
- Runtime hook profiles (FORGE_HOOK_PROFILE: minimal/standard/strict)
- Cross-platform support: Claude Code (full), Codex CLI (partial), Gemini CLI (partial)
