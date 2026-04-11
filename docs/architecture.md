# Forge Technical Architecture

## Overview

Forge is a Claude Code plugin that enforces a phase-locked development workflow. It consists of 12 skills, 9 agents, 5 hooks, 4 commands, and a project-level CLAUDE.md organized into a standard Claude Code plugin structure.

## Plugin Structure

```
forge/
  .claude-plugin/
    plugin.json              # Plugin metadata (name, version, author)
    marketplace.json         # Marketplace catalog entry
  package.json               # npm metadata
  skills/
    discover-intent/SKILL.md # Phase: Discovery
    shape-design/SKILL.md    # Phase: Design
    chart-tasks/SKILL.md     # Phase: Planning
    drive-execution/SKILL.md # Phase: Execution (orchestrator)
    prove-first/SKILL.md     # Phase: Execution (per-task TDD)
    inspect-work/SKILL.md    # Phase: Verification (per-task review)
    confirm-complete/SKILL.md# Phase: Verification (end-to-end)
    land-changes/SKILL.md    # Phase: Integration
    trace-fault/SKILL.md     # Phase: Any (debugging)
    distill-lessons/SKILL.md # Phase: Any (terminal retrospective)
    receive-feedback/SKILL.md# Phase: Any (code review receiving)
    isolate-work/SKILL.md    # Phase: Any (git worktree management)
  agents/
    spec-analyst.md          # Validates specs (opus, read-only)
    task-decomposer.md       # Decomposes specs into tasks (opus, read-only)
    implementer.md           # Executes tasks with TDD (opus, full access)
    quality-auditor.md       # Spec compliance + code quality review (opus, read+bash)
    security-sentinel.md     # OWASP vulnerability scanning (opus, read+bash)
    test-strategist.md       # Test coverage auditing (opus, read+bash)
    dependency-mapper.md     # Change impact analysis (opus, read-only)
    integration-verifier.md  # Full suite + build checks (opus, read+bash)
    doc-synthesizer.md       # Documentation sync (opus, read+write)
  hooks/
    hooks.json               # Hook event declarations
  scripts/hooks/
    session-init.cjs          # SessionStart: load state, show status
    phase-gate.cjs            # PreToolUse: block code edits in pre-execution phases
    evidence-collector.cjs    # PostToolUse: capture test/build output
    commit-guardian.cjs       # PreToolUse: validate verification before commits
    session-capture.cjs       # SessionEnd: save state for cross-session continuity
  CLAUDE.md                  # Consolidated rules (workflow, quality, safety)
  .codex/AGENTS.md           # Codex CLI compatibility
  gemini-extension.json      # Gemini CLI compatibility
  docs/                      # Design docs, validation reports
```

## Workflow State Machine

```
  DISCOVERY --user approves--> DESIGN --user approves spec--> PLANNING
                                                                  |
                                                      plan complete
                                                                  |
                                                                  v
                                                            EXECUTION
                                                           /    |    \
                                                    per-task  review  all done
                                                        |       |       |
                                                   prove-first  |  VERIFICATION
                                                        |       |       |
                                                   inspect-work-+   pass/fail
                                                                    |     |
                                                              INTEGRATION |
                                                                    |   back to
                                                                    |  EXECUTION
                                                             COMPLETE
```

Each phase transition requires evidence (user approval, passing tests, review results). The `.forge/forge-state.json` file tracks the current phase, completed phases, accumulated evidence, and task progress.

## Key Design Decisions

### Phase Locking
Phases proceed in strict order. The phase-gate hook prevents code edits during Discovery, Design, and Planning phases via PreToolUse interception on Write, Edit, and MultiEdit tools. Phase transitions themselves are managed by skill instructions and the user-invoked `/forge:advance` skill, which checks gate conditions before progressing.

### Fresh Agent Per Task
The drive-execution skill dispatches a fresh implementer agent for each plan task. This prevents context pollution between tasks and ensures each task gets focused attention. The orchestrator never implements tasks itself.

### Three-Stage Review
The inspect-work skill reviews across three dimensions: spec compliance, code quality, then security. The quality-auditor agent handles the first two stages; the security-sentinel handles the third. Spec compliance must pass before code quality review begins. This order matters: there is no point polishing code that does not match the spec.

### Evidence Collection
The evidence-collector hook automatically captures test and build output to `.forge/evidence/`, including the command's exit code and a machine-readable `Status: PASS/FAIL/UNKNOWN` field. The commit-guardian hook validates that evidence represents passing results, not just command execution. The confirm-complete skill requires this evidence before allowing progression to integration.

### Runtime Profiles
All hooks check `FORGE_HOOK_PROFILE` (minimal/standard/strict) and `FORGE_DISABLED_HOOKS` before executing. This lets users tune strictness without editing files.

### Project-Local State
Workflow state lives in `.forge/` inside the project (not in a global location). This means state survives across sessions on the same machine. The `.gitignore` excludes `.forge/` from version control, so state does not transfer between machines or contributors.

## Model Routing

| Model | Agents | Rationale |
|-------|--------|-----------|
| opus | All 9 agents (spec-analyst, task-decomposer, implementer, quality-auditor, security-sentinel, test-strategist, integration-verifier, dependency-mapper, doc-synthesizer) | Reasoning, judgment, contextual understanding |

## Security Model

- Hook scripts sanitize all stdin-sourced data before writing to files
- Hook scripts exit 0 on error (graceful failure, never catastrophic blocking)
- All paths use `${CLAUDE_PLUGIN_ROOT}` or `process.cwd()` (no hardcoded paths)
- The implementer is the only agent with Write/Edit/Bash access
- All other agents are read-only or read+bash (no file modification)
