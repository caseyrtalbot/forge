# Forge for Codex

Forge is a phase-locked development workflow plugin. When using Codex CLI, the following agents and skills are available.

## Available Skills

Skills are in the `skills/` directory. Each `SKILL.md` file contains workflow instructions that Codex can follow.

Key skills:
- `skills/discover-intent/SKILL.md` -- start here for new work
- `skills/shape-design/SKILL.md` -- create spec documents
- `skills/chart-tasks/SKILL.md` -- decompose specs into tasks
- `skills/prove-first/SKILL.md` -- test-first development
- `skills/trace-fault/SKILL.md` -- systematic debugging

## Available Agents

Agent definitions are in the `agents/` directory. Each `.md` file defines a specialist agent with specific tools and responsibilities.

## Workflow

Follow the phase order: Discovery > Design > Planning > Execution > Verification > Integration. Each phase has a corresponding skill. Do not skip phases.

## Installation

```
Fetch and follow instructions from https://raw.githubusercontent.com/forge-workflow/forge/main/.codex/AGENTS.md
```

Then clone the repo and reference skills directly:
```bash
git clone https://github.com/forge-workflow/forge.git ~/.codex/forge
```
