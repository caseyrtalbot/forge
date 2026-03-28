# Changelog

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
