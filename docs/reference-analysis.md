# Reference Plugin Architecture Analysis

> This document is the consolidated output of Iteration 1. It is READ-ONLY after this iteration and serves as the source of truth for what was learned from the three reference plugins.

---

## 1. gstack (github.com/garrytan/gstack)

**Identity**: "Garry's Stack" -- turns Claude Code into a virtual engineering team with 28 specialists and 8 power tools, all activated via slash commands. Created by Garry Tan (YC President/CEO). Sprint-based workflow metaphor.

### 1.1 Directory Structure

Each skill is a **top-level directory** in the repo root (not nested under a `skills/` parent):

```
gstack/
  autoplan/          benchmark/         browse/            canary/
  careful/           codex/             connect-chrome/    cso/
  design-consultation/ design-review/   document-release/  freeze/
  gstack-upgrade/    guard/             investigate/       land-and-deploy/
  office-hours/      plan-ceo-review/   plan-design-review/ plan-eng-review/
  qa/                qa-only/           retro/             review/
  setup-browser-cookies/ setup-deploy/  ship/              unfreeze/
  bin/               lib/               scripts/           extension/
  docs/              supabase/          test/              browse/
  .agents/           .claude/           .context/          .github/
```

### 1.2 Plugin Manifest

gstack does NOT use the `.claude-plugin/plugin.json` standard. Installation is via `git clone` + `./setup` script. The setup script creates symlinks from `~/.claude/skills/` into the cloned repo. No marketplace integration.

`package.json` declares it as a Bun-based project with compiled binaries.

### 1.3 Skill Format

Each skill directory contains two files:
- `SKILL.md.tmpl` -- human-authored source with `{{PLACEHOLDER}}` tokens
- `SKILL.md` -- generated output, committed to repo, never edited directly

**Frontmatter schema (YAML)**:
```yaml
---
name: review                    # Skill identifier
preamble-tier: 4                # 1-4, controls shared preamble depth
version: 1.0.0                  # Semantic version
description: |                  # Multi-line, used for discovery/trigger
  Pre-landing PR review...
allowed-tools:                  # Explicit tool whitelist
  - Bash
  - Read
  - Edit
  - Agent
hooks:                          # Optional, for safety skills only
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bash ${CLAUDE_SKILL_DIR}/bin/check-careful.sh"
---
```

Skills are long (1,500-2,000 lines for complex ones). They contain detailed natural-language instructions, embedded bash blocks, decision trees, and escalation protocols. The agent follows the Markdown like a runbook.

**Template generation**: `bun run gen:skill-docs` compiles `.tmpl` files into `SKILL.md` using resolvers in `scripts/resolvers/`. This prevents docs drift -- generated docs cannot diverge from source code because they are built from it.

### 1.4 Agent Definitions

gstack does NOT use Claude's sub-agent system for multi-agent orchestration. Instead it uses **role-framing in prompts**: a single agent reads the skill's instructions and adopts the specified persona (e.g., "act as a paranoid staff engineer" for /review, "find the 10-star product" for /plan-ceo-review).

For Codex/OpenAI compatibility, `.agents/skills/` contains generated `openai.yaml` wrappers.

### 1.5 Hook System

Only two skills install hooks, both via YAML frontmatter in SKILL.md:

- `/careful` -- PreToolUse on Bash: checks commands against a destructive pattern list (rm -rf, DROP TABLE, git push --force, etc.)
- `/freeze` -- PreToolUse on Edit/Write: blocks edits outside a configured scope boundary

Hooks are session-scoped (activate on skill invocation, deactivate on session end).

### 1.6 MCP Servers

**Deliberately omitted.** From ARCHITECTURE.md: "No MCP protocol. MCP adds JSON schema overhead per request and requires a persistent connection. Plain HTTP + plain text output is lighter on tokens and easier to debug."

### 1.7 Rules/Instructions

- `CLAUDE.md` -- developer instructions for working on gstack itself
- `ETHOS.md` -- injected into every skill's preamble. Contains the "Boil the Lake" philosophy, three layers of knowledge (tried-and-true, new-and-popular, first-principles), and the builder's creed
- `review/checklist.md` -- detailed code review checklist (SQL safety, race conditions, LLM trust boundaries)
- End users add a `## gstack` section to their project's CLAUDE.md listing available skills

### 1.8 Installation

1. User pastes a prompt into Claude Code that runs: `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`
2. `./setup` checks for Bun, builds browse binary, generates Codex docs, installs Chromium, creates symlinks per host platform (Claude/Codex/Kiro)
3. Claude updates project CLAUDE.md with a gstack section

### 1.9 Unique Innovations

1. **Tiered preamble system**: Shared preamble generated by `preamble.ts`, injected into every skill. Tiers 1-4 control depth (T1=lightweight, T4=full workflow with test triage, completeness principles, voice directives)
2. **Browser daemon**: Persistent Playwright-based Chromium over localhost HTTP with bearer token auth. ~100-200ms per subsequent call. Ref system (@e1, @e2) uses accessibility tree locators.
3. **Template-generated docs**: Source code defines commands, templates define explanations, build step generates finals. Eliminates docs drift permanently.
4. **Sprint metaphor**: Think > Plan > Build > Review > Test > Ship > Reflect. Each skill feeds state to the next via files.
5. **Config/state system**: `~/.gstack/config.yaml` for preferences, `~/.gstack/sessions/` for session tracking, `~/.gstack/analytics/` for local JSONL analytics, `~/.gstack/reviews/` for review results.
6. **Telemetry as product**: Three modes (off/anonymous/community), public schema, local analytics always-on.

---

## 2. superpowers (github.com/obra/superpowers)

**Identity**: "Complete software development workflow for coding agents, built on composable skills." Created by Jesse Vincent (Prime Radiant). Mandatory workflows, not suggestions. Design-first, test-driven, evidence-based.

### 2.1 Directory Structure

```
superpowers/
  .claude-plugin/
    plugin.json                # Plugin metadata
    marketplace.json           # Marketplace catalog
  skills/
    brainstorming/
      SKILL.md                 # Skill definition
      scripts/                 # Supporting scripts (server, templates)
      visual-companion.md      # Referenced docs
    writing-plans/
      SKILL.md
      plan-document-reviewer-prompt.md
    executing-plans/SKILL.md
    test-driven-development/
      SKILL.md
      testing-anti-patterns.md
    systematic-debugging/
      SKILL.md
      root-cause-tracing.md
      defense-in-depth.md
      condition-based-waiting.md
      find-polluter.sh
    verification-before-completion/SKILL.md
    dispatching-parallel-agents/SKILL.md
    requesting-code-review/
      SKILL.md
      code-reviewer.md
    receiving-code-review/SKILL.md
    using-git-worktrees/SKILL.md
    finishing-a-development-branch/SKILL.md
    subagent-driven-development/
      SKILL.md
      implementer-prompt.md
      spec-reviewer-prompt.md
      code-quality-reviewer-prompt.md
    writing-skills/
      SKILL.md
      anthropic-best-practices.md
      testing-skills-with-subagents.md
    using-superpowers/
      SKILL.md
      references/codex-tools.md
  agents/
    code-reviewer.md
  hooks/
    hooks.json
    run-hook.cmd
    session-start/
  commands/
    brainstorm.md
    execute-plan.md
    write-plan.md
  docs/
    plans/                     # Internal design plans
    superpowers/plans/         # Plugin-specific plans
    superpowers/specs/         # Design specs
  tests/                       # Test suites
  package.json
  GEMINI.md                    # Gemini CLI adapter
  gemini-extension.json        # Gemini extension manifest
```

### 2.2 Plugin Manifest

**`.claude-plugin/plugin.json`**:
```json
{
  "name": "superpowers",
  "description": "Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques",
  "version": "5.0.6",
  "author": { "name": "Jesse Vincent", "email": "jesse@fsck.com" },
  "homepage": "https://github.com/obra/superpowers",
  "repository": "https://github.com/obra/superpowers",
  "license": "MIT",
  "keywords": ["skills", "tdd", "debugging", "collaboration", "best-practices", "workflows"]
}
```

**`marketplace.json`**:
```json
{
  "name": "superpowers-dev",
  "description": "Development marketplace for Superpowers core skills library",
  "owner": { "name": "Jesse Vincent", "email": "jesse@fsck.com" },
  "plugins": [{
    "name": "superpowers",
    "description": "Core skills library...",
    "version": "5.0.6",
    "source": "./"
  }]
}
```

### 2.3 Skill Format

**Frontmatter schema (YAML)**:
```yaml
---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---
```

Minimal frontmatter: just `name` and `description`. The description doubles as the trigger condition (Claude reads it and auto-loads when the user's intent matches).

**Key structural patterns in skill bodies**:

1. **HARD-GATE tags**: `<HARD-GATE>Do NOT invoke any implementation skill, write any code...until you have presented a design and the user has approved it.</HARD-GATE>` -- prevents progression without evidence.

2. **Checklists**: Skills define ordered task lists that Claude MUST create as tasks and complete in sequence.

3. **Graphviz process flows**: Every skill includes a `digraph` that maps the skill's state machine visually. This is not decorative -- it defines the actual flow.

4. **Anti-pattern sections**: Explicit documentation of what NOT to do (e.g., "This Is Too Simple To Need A Design" anti-pattern).

5. **Transition declarations**: Each skill explicitly names what skill comes next (e.g., brainstorming's terminal state is "Invoke writing-plans skill").

6. **Referenced prompts**: Supporting markdown files alongside SKILL.md provide specialized sub-prompts (e.g., `plan-document-reviewer-prompt.md`, `implementer-prompt.md`).

### 2.4 Agent Definitions

Single agent file: `agents/code-reviewer.md`. Format uses markdown frontmatter with name, description, tools array. The agent prompt defines review methodology and output format.

Most "agent" behavior is embedded in skills via subagent dispatch instructions rather than standalone agent definitions.

### 2.5 Hook System

**`hooks/hooks.json`**:
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup|clear|compact",
      "hooks": [{
        "type": "command",
        "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
        "async": false
      }]
    }]
  }
}
```

Minimal hook footprint: only SessionStart. The hook runs a session initialization script. All workflow enforcement happens through skill auto-triggering and hard gates in skill prose, NOT through hooks intercepting tool use.

### 2.6 MCP Servers

None declared. No `.mcp.json`. Plugin is pure skills/agents/hooks.

### 2.7 Rules

No `rules/` directory. The `using-superpowers` skill functions as the meta-rule: it's loaded at session start and instructs Claude to check for relevant skills before any task. It includes a decision flowchart, red flag table, and priority ordering for skill selection.

### 2.8 Installation

Multiple methods:
- Official marketplace: `/plugin install superpowers@claude-plugins-official`
- Community marketplace: `/plugin marketplace add obra/superpowers-marketplace` then `/plugin install superpowers@superpowers-marketplace`
- Cursor: `/add-plugin superpowers`
- Codex: Fetch and follow `.codex/INSTALL.md`
- OpenCode: Fetch and follow `.opencode/INSTALL.md`
- Gemini CLI: `gemini extensions install https://github.com/obra/superpowers`

### 2.9 Unique Innovations

1. **Mandatory workflow enforcement**: Skills trigger automatically based on context. "The agent checks for relevant skills before any task. Mandatory workflows, not suggestions."
2. **Hard gates**: XML-tagged blocks that absolutely prevent progression (no code before design, no completion before verification).
3. **Graphviz process flows**: Visual state machines in every skill define the actual workflow.
4. **Two-stage code review**: First pass checks spec compliance, second pass checks code quality.
5. **Subagent-driven development**: Fresh subagent per task with two-stage review.
6. **Spec self-review**: Quick inline check for placeholders, contradictions, ambiguity before user reviews.
7. **Worktree isolation**: Git worktrees for feature branches with setup verification.
8. **Skill chaining**: Explicit transition declarations create a connected workflow graph (brainstorming > writing-plans > executing-plans > requesting-code-review > finishing-a-development-branch).
9. **Cross-platform adapters**: GEMINI.md, gemini-extension.json, .codex/INSTALL.md, .opencode/ directory.

---

## 3. everything-claude-code (github.com/affaan-m/everything-claude-code)

**Identity**: "The performance optimization system for AI agent harnesses." Created by Affaan Mustafa (Anthropic hackathon winner). Breadth-first approach: 28 agents, 125 skills, 60 commands across 2,251 files and 12 language ecosystems.

### 3.1 Directory Structure

```
everything-claude-code/
  .claude-plugin/
    plugin.json
    marketplace.json
    PLUGIN_SCHEMA_NOTES.md
    README.md
  .claude/
    commands/                  # 3 built-in commands
    ecc-tools.json
    enterprise/controls.md
    homunculus/instincts/      # Continuous learning system
    identity.json              # Agent identity config
    package-manager.json
    research/                  # Research playbooks
    rules/                     # Guardrails
    skills/everything-claude-code/SKILL.md
    team/                      # Team config
  .agents/skills/              # Cross-platform skills (26 skills with openai.yaml)
    api-design/   article-writing/   backend-patterns/   bun-runtime/
    claude-api/   coding-standards/  content-engine/     crosspost/
    deep-research/ dmux-workflows/   documentation-lookup/ e2e-testing/
    eval-harness/ everything-claude-code/ exa-search/    fal-ai-media/
    frontend-patterns/ frontend-slides/ investor-materials/ investor-outreach/
    market-research/ mcp-server-patterns/ nextjs-turbopack/ security-review/
    strategic-compact/ tdd-workflow/ verification-loop/  video-editing/ x-api/
  agents/                      # 28 Claude Code agents
    planner.md    architect.md    tdd-guide.md    code-reviewer.md
    security-reviewer.md    build-error-resolver.md    e2e-runner.md
    refactor-cleaner.md     doc-updater.md    docs-lookup.md
    chief-of-staff.md       loop-operator.md  harness-optimizer.md
    cpp-reviewer.md   go-reviewer.md    python-reviewer.md
    typescript-reviewer.md  java-reviewer.md  kotlin-reviewer.md
    database-reviewer.md    ... (28 total)
  skills/                      # Claude Code skills (organized by topic)
    tdd-workflow/SKILL.md
    ... (125+ skills)
  commands/                    # 60 slash commands
  hooks/hooks.json             # Extensive hook system
  rules/
    common/                    # Language-agnostic (9 files)
    typescript/                # TS-specific (5 files)
    python/                    # Python-specific (5 files)
    golang/                    # Go-specific (5 files)
    ... (12 language ecosystems)
  scripts/
    hooks/                     # Hook implementation scripts
    install-plan.js            # Selective install planner
    install-apply.js           # Selective install executor
    setup-package-manager.js   # Package manager detection
  .cursor/                     # Cursor IDE hooks + rules
  .codex/                      # Codex CLI agents + config
  .opencode/                   # OpenCode plugin
  install.sh                   # Unix installer
  install.ps1                  # Windows installer
```

### 3.2 Plugin Manifest

**`.claude-plugin/plugin.json`**:
```json
{
  "name": "everything-claude-code",
  "version": "1.9.0",
  "description": "Complete collection of battle-tested Claude Code configs...",
  "author": { "name": "Affaan Mustafa" },
  "homepage": "https://github.com/affaan-m/everything-claude-code",
  "license": "MIT",
  "keywords": ["claude-code", "agents", "skills", "hooks", "rules", "tdd", "security"]
}
```

**`marketplace.json`** follows the `$schema: https://anthropic.com/claude-code/marketplace.schema.json` standard with `plugins[]` array containing name, source, description, version, category, tags, strict flag.

### 3.3 Skill Format

Two locations:
1. `skills/<name>/SKILL.md` -- Claude Code skills with standard frontmatter
2. `.agents/skills/<name>/SKILL.md` + `agents/openai.yaml` -- cross-platform skills with Codex adapters

**Frontmatter schema**:
```yaml
---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage.
origin: ECC
---
```

Fields: `name`, `description`, `origin` (branding). Simpler than gstack (no preamble-tier, no allowed-tools, no hooks in frontmatter).

### 3.4 Agent Definitions

28 agents with rich frontmatter:
```yaml
---
name: planner
description: Expert planning specialist for complex features and refactoring...
tools: ["Read", "Grep", "Glob"]
model: opus
---
```

Fields: `name`, `description`, `tools[]` (restricted tool access), `model` (routing hint). Body contains system prompt with role definition, methodology, constraints, and output format.

Agents are categorized: planning (planner, architect), quality (code-reviewer, security-reviewer, tdd-guide), language-specific (typescript-reviewer, go-reviewer, python-reviewer, java-reviewer, kotlin-reviewer, cpp-reviewer), infrastructure (build-error-resolver, database-reviewer, harness-optimizer, loop-operator).

### 3.5 Hook System

Extensive. `hooks/hooks.json` defines hooks for:

**PreToolUse**:
- `Bash` matcher: block-no-verify (prevents git --no-verify), auto-tmux-dev, tmux-reminder, git-push-reminder
- `Write|Edit` matcher: doc-file-warning, suggest-compact, typecheck
- `Edit|Write|MultiEdit` matcher: continuous learning observer (async), security monitor, governance capture
- `*` matcher: universal observation hook

**PostToolUse**:
- Edit result hooks, shell result hooks

**SessionStart**:
- Session initialization, context loading

**Stop**:
- Session summary capture

**Runtime controls**:
- `ECC_HOOK_PROFILE=minimal|standard|strict` -- controls which hooks fire
- `ECC_DISABLED_HOOKS=hook-id-1,hook-id-2` -- disable specific hooks
- `run-with-flags.js` wrapper checks profile before executing hook logic

### 3.6 MCP Servers

`.claude/ecc-tools.json` defines custom tools. No standalone MCP server bundled, but supports external MCP integrations (InsAIts security, AgentShield).

### 3.7 Rules

Multi-language architecture:
```
rules/
  common/
    common-agents.md          common-coding-style.md
    common-development-workflow.md  common-git-workflow.md
    common-hooks.md           common-patterns.md
    common-performance.md     common-security.md
    common-testing.md
  typescript/
    typescript-coding-style.md  typescript-hooks.md
    typescript-patterns.md    typescript-security.md
    typescript-testing.md
  python/    golang/    swift/    php/    perl/
  kotlin/    java/      cpp/      rust/
```

Install script copies only selected language rules to the user's project.

### 3.8 Installation

1. Plugin install: `/plugin marketplace add affaan-m/everything-claude-code` then `/plugin install everything-claude-code@everything-claude-code`
2. Rules install (required, not auto-installed): `git clone` + `./install.sh typescript` (selective by language)
3. Windows: `install.ps1` PowerShell script
4. npm: `npx ecc-install typescript`

### 3.9 Unique Innovations

1. **Scale**: 2,251 files, 28 agents, 125 skills, 60 commands, 12 language ecosystems. Breadth-first approach.
2. **Homunculus/instincts**: Continuous learning system with confidence scoring. Auto-extracts patterns from sessions into reusable instincts.
3. **Hook runtime profiling**: Three strictness levels (minimal/standard/strict) controlled by environment variable, plus per-hook disabling.
4. **Selective install**: Manifest-driven pipeline (install-plan.js + install-apply.js) with state tracking for incremental updates.
5. **Cross-platform parity**: Same plugin ships for Claude Code, Cursor, Codex, OpenCode, and Antigravity with platform-specific adapters.
6. **Governance capture**: Optional hooks that log secrets exposure, policy violations, and approval requests.
7. **Identity system**: `.claude/identity.json` configures agent personality/identity.
8. **Enterprise controls**: `.claude/enterprise/controls.md` for organizational policy enforcement.
9. **Package manager detection**: 6-level priority cascade (env var > project config > package.json > lock file > global config > fallback).

---

## 4. Comparative Analysis

### 4.1 Architecture Comparison

| Dimension | gstack | superpowers | everything-claude-code |
|-----------|--------|-------------|----------------------|
| **Total files** | ~200 | ~120 | 2,251 |
| **Skills** | 28 (top-level dirs) | 14 (skills/ subdirs) | 125 (skills/ + .agents/) |
| **Agents** | 0 (role-framing) | 1 (code-reviewer) | 28 (standalone) |
| **Hooks** | 2 (in skill frontmatter) | 1 (SessionStart) | 15+ (extensive) |
| **Commands** | 0 (skills ARE commands) | 3 | 60 |
| **Rules** | 0 (ETHOS.md) | 0 (using-superpowers) | 50+ (multi-language) |
| **Manifest** | None (git clone) | plugin.json + marketplace | plugin.json + marketplace |
| **Platforms** | Claude, Codex, Kiro | Claude, Codex, OpenCode, Gemini, Cursor | Claude, Codex, Cursor, OpenCode, Antigravity |

### 4.2 Philosophy Comparison

| Aspect | gstack | superpowers | everything-claude-code |
|--------|--------|-------------|----------------------|
| **Core metaphor** | Virtual eng team | Mandatory workflows | Harness performance |
| **Workflow model** | Sprint phases | Design > Plan > Execute > Review > Finish | Flexible (no enforced order) |
| **Enforcement** | Role personas | Hard gates + auto-trigger | Hook profiles + breadth |
| **Agent model** | Single agent, role-framed | Single + subagent dispatch | 28 standalone specialists |
| **Evidence requirement** | Moderate (checklist) | Strict (HARD-GATE tags) | Moderate (coverage %) |
| **Breadth vs depth** | Narrow + deep | Narrow + deep | Very broad + shallow |
| **Learning** | Local analytics | None | Homunculus/instincts |
| **Unique capability** | Browser automation | Subagent-driven dev | Cross-platform scale |

### 4.3 What Works (Patterns to Preserve)

1. **From gstack**: Tiered preamble (shared behavior with depth control), template-generated docs (eliminate drift), sprint metaphor (coherent ordering), file-based state passing between skills
2. **From superpowers**: Hard gates (enforceable progression requirements), graphviz process flows (visual state machines), skill auto-triggering (context-aware activation), explicit transition declarations (connected workflow graph), two-stage review, spec self-review
3. **From ECC**: Agent definitions with tool/model frontmatter, hook runtime profiling (strictness levels), cross-platform manifest format, selective installation, multi-language rules architecture

### 4.4 What to Avoid

1. **From gstack**: Browser daemon (out of scope for workflow plugin), telemetry infrastructure (complexity), template build system (adds build step dependency)
2. **From superpowers**: Only 1 agent definition (limits delegation capability), no rules directory (relies entirely on using-superpowers skill for behavioral framing)
3. **From ECC**: 2,251 files (unsustainable breadth), shallow skill depth (many skills are brief), identity.json/homunculus complexity, too many hooks (cognitive overhead)

---

## 5. Plugin System Spec Summary

Based on analysis of both working plugins and documentation:

### Required Files
- `.claude-plugin/plugin.json` -- name, version, description, author, license (minimum: name + version)
- `.claude-plugin/marketplace.json` -- marketplace catalog with plugins[] array

### Optional Directories (auto-discovered on install)
- `skills/<name>/SKILL.md` -- skill definitions
- `agents/<name>.md` -- agent definitions
- `commands/<name>.md` -- slash command definitions
- `hooks/hooks.json` -- hook declarations
- `rules/` -- rule files (NOT auto-installed, must be copied manually)

### Skill Frontmatter
- `name` (required) -- identifier
- `description` (required) -- trigger text and purpose

### Agent Frontmatter
- `name` (required) -- identifier
- `description` (required) -- purpose and activation conditions
- `tools` (optional) -- array of permitted tool names
- `model` (optional) -- model routing hint

### Hook Events
- `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`
- Hooks use `${CLAUDE_PLUGIN_ROOT}` for portable path references

### Installation Methods
- `/plugin install <name>@<marketplace>` -- from configured marketplace
- `/plugin marketplace add <owner>/<repo>` -- register marketplace source
- `git clone` + manual setup -- traditional method
