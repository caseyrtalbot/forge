# Forge: Design Principles

---

## 1. Identity

Forge is a phase-locked development workflow plugin for Claude Code that treats software construction as a series of earned progressions. Rather than offering a bag of tools or role-playing as a team, Forge enforces that each phase of work (discovery, design, planning, execution, verification, integration) must produce demonstrable evidence before the next phase unlocks. The result is a focused, opinionated system where the agent cannot skip steps, cut corners, or claim completion without proof.

---

## 2. Core Philosophy

### Seven Principles

**Principle 1: Earned Progression**
Work advances through phases, and each transition requires evidence. A design cannot become a plan until the user approves it. A plan cannot be executed until tasks have verification criteria. Code cannot be committed until tests pass. There are no shortcuts, no manual overrides, no "just trust me." The evidence gate is the atomic unit of quality.

**Principle 2: Transparent State**
The current phase, pending gates, and accumulated evidence are always visible and queryable. The agent never operates in a black box. Users can ask "where are we?" at any point and receive an honest, auditable answer. State lives in files, not in memory.

**Principle 3: Scope Discipline**
Forge does one thing well: structured software development workflow. It does not automate browsers, manage infrastructure, generate presentations, handle investor outreach, or provide language-specific linting rules. Every component must serve the core workflow. If a capability does not help move work from idea to merged code, it does not belong in Forge.

**Principle 4: Depth Over Breadth**
A small number of skills, deeply specified, beats a large number of skills, thinly specified. Each Forge skill is a complete operating manual for its phase: trigger conditions, process flow, hard gates, anti-patterns, evidence requirements, and transition criteria. A user should be able to read one skill and understand exactly what will happen.

**Principle 5: Agent Autonomy With Boundaries**
Subagents should be capable of working autonomously for extended periods within clearly defined scope boundaries. They receive specific tasks, specific tool access, and specific success criteria. They do not receive open-ended mandates. The orchestrating skill reviews their work before accepting it.

**Principle 6: Composable Without Coupling**
Each skill is self-contained and could theoretically function alone. But when used together, skills form a pipeline where each phase's output becomes the next phase's input. This composability comes from shared conventions (file locations, document formats, state tracking), not from hard dependencies or imports.

**Principle 7: Verification Is Not Optional**
Every claim of completion must be backed by executed evidence. "I wrote the tests" is not evidence. "The test suite ran and all 47 tests passed (output attached)" is evidence. "The build succeeded" requires the build output. "The code is secure" requires the security audit results. The verification skill exists to enforce this, but the principle pervades every skill.

---

## 3. Workflow Model

Forge's development lifecycle is a directed acyclic graph of phases with explicit gate conditions between them.

### State Machine

```
  [DISCOVERY] --approval--> [DESIGN] --approval--> [PLANNING]
       |                        |                       |
       v                        v                       v
  (user refines idea)    (spec written,          (tasks decomposed,
                          self-reviewed,          verification criteria
                          user approved)          assigned per task)
                                                       |
                                                       v
                                              [EXECUTION] <--review-fail--+
                                                   |                      |
                                                   v                      |
                                              [VERIFICATION] --fail-->----+
                                                   |
                                                   v (all gates pass)
                                              [INTEGRATION]
                                                   |
                                                   v
                                              [COMPLETE]
```

### Phase Definitions

| Phase | Entry Gate | Work Done | Exit Gate |
|-------|-----------|-----------|-----------|
| **Discovery** | User initiates | Collaborative refinement of what to build. Questions, alternatives, constraints explored. | User approves direction |
| **Design** | Approved direction | Spec document written covering architecture, data flow, edge cases, error handling. Self-reviewed for placeholders and contradictions. | User approves spec document |
| **Planning** | Approved spec | Spec decomposed into ordered tasks. Each task has file paths, verification criteria, and estimated scope. Dependencies mapped. | Plan document complete with all tasks having verification criteria |
| **Execution** | Complete plan | Tasks executed in order (or parallel where independent). Test-first discipline enforced. Each task verified individually. | All tasks executed and individually verified |
| **Verification** | All tasks complete | End-to-end verification: full test suite, build check, security scan, spec compliance audit. | All verification checks pass |
| **Integration** | Verification passes | Branch prepared, PR created or merge executed, worktree cleaned up. | Code integrated into target branch |

### Transition Rules

1. Phases MUST proceed in order. No skipping.
2. Each transition requires the exit gate of the current phase AND the entry gate of the next phase to pass.
3. Failure at any gate returns work to the current phase for remediation, not to a prior phase.
4. The user can abandon the workflow at any point but cannot skip a phase.
5. Multiple cycles through Execution > Verification are expected and normal (fix-verify loop).

### State Persistence

Workflow state is tracked in a `forge-state.json` file in the project's `.forge/` directory:
```json
{
  "workflow_id": "feat-user-auth-2026-03-27",
  "current_phase": "execution",
  "phases_completed": ["discovery", "design", "planning"],
  "evidence": {
    "discovery": { "approval": "user approved direction at 2026-03-27T14:30Z" },
    "design": { "spec": "docs/forge/specs/user-auth-design.md", "approval": "user approved at 2026-03-27T15:00Z" },
    "planning": { "plan": "docs/forge/plans/user-auth-plan.md", "tasks": 8, "all_have_verification": true }
  },
  "current_task": 4,
  "total_tasks": 8
}
```

---

## 4. Differentiation Matrix

| Aspect | gstack Approach | superpowers Approach | ECC Approach | **Forge Approach** |
|--------|----------------|---------------------|-------------|-------------------|
| **Workflow enforcement** | Role personas in prompts | Hard gates in skill prose | Hook-based profiling | **Phase-locked state machine with evidence gates** |
| **Skill depth** | Very deep (1500-2000 lines) | Deep (500-1000 lines) | Shallow (100-300 lines) | **Deep (500-800 lines) with process flow diagrams** |
| **Agent model** | Single agent, role-framed | Single + ad-hoc subagents | 28 standalone agents | **10-15 capability-focused agents with explicit scope** |
| **Hook philosophy** | Minimal (2 safety hooks) | Minimal (1 session hook) | Extensive (15+ hooks) | **Focused (5 hooks) with runtime profiles** |
| **State tracking** | ~/.gstack/ files | None persistent | SQLite state store | **Project-local .forge/ directory with JSON state** |
| **Ordering metaphor** | Sprint (Think>Plan>Build>Review>Test>Ship) | Chain (brainstorm>plan>execute>review>finish) | Flexible (no enforced order) | **Phase lock (discovery>design>planning>execution>verification>integration)** |
| **Evidence model** | Checklists | HARD-GATE tags | Coverage percentages | **Gate conditions requiring executed output** |
| **Cross-platform** | Claude, Codex, Kiro | Claude, Codex, OpenCode, Gemini, Cursor | Claude, Codex, Cursor, OpenCode, Antigravity | **Claude Code primary, Codex/Gemini secondary** |
| **Scope** | 28 skills + browser | 14 skills | 125 skills + 60 commands | **10-12 core skills, nothing extraneous** |
| **Learning** | Local analytics | None | Homunculus/instincts | **None (out of scope, complexity not justified)** |

### What Forge Takes Inspiration From (and Transforms)

| Source | Pattern | Forge Transformation |
|--------|---------|---------------------|
| superpowers | Hard gates preventing code before design | Evidence gates at every phase transition, not just design>code |
| superpowers | Graphviz process flows | Every skill has a dot diagram defining its state machine |
| superpowers | Skill auto-triggering | Context-aware phase detection triggers the appropriate skill |
| superpowers | Two-stage code review | Multi-dimensional verification (spec compliance, code quality, security) |
| gstack | Sprint ordering metaphor | Phase-locked progression with no skip capability |
| gstack | Tiered shared behavior | Hook runtime profiles (lightweight/standard/strict) |
| gstack | File-based state between skills | `.forge/` project directory with structured JSON state |
| ECC | Agent definitions with tool/model frontmatter | Capability-focused agents with restricted tool access |
| ECC | Hook runtime profiling | Environment variable controls for hook strictness |
| ECC | Cross-platform manifest format | Standard .claude-plugin/ with marketplace.json |

### What Forge Deliberately Omits

| Omission | Why |
|----------|-----|
| Browser automation | Out of scope. Forge is a workflow plugin, not a browser tool. |
| Language-specific rules | Rules should be language-agnostic workflow guidance. Language linting belongs in linters. |
| Telemetry/analytics | Complexity not justified. Users can track usage via git history. |
| Continuous learning/instincts | Premature optimization. Ship the workflow first, add learning later if needed. |
| 60+ slash commands | Commands should map 1:1 to workflow actions. 4-6 commands is the right number. |
| Template generation build step | Skills are authored directly. No build dependency. |
| Identity/personality systems | The agent's behavior comes from skill instructions, not persona configuration. |
| Enterprise controls | Out of scope for v1. Organizational policy is a separate concern. |

### What Is Entirely New in Forge

1. **Phase-locked state machine**: No reference plugin enforces a strict phase progression with evidence gates at critical transitions. gstack suggests an order. superpowers has hard gates at design>code. Forge enforces critical transitions through hooks (phase-gate blocks code edits before a plan exists; commit-guardian blocks commits without passing test evidence) and guides the rest through deeply specified skill instructions with hard gates and anti-patterns.
2. **Project-local workflow state**: `.forge/` directory tracks workflow progress in the project itself (not in a global location). State survives across sessions on the same machine. The `.forge/` directory is gitignored and does not transfer between machines or contributors.
3. **Evidence accumulation**: Each phase produces evidence that is recorded and auditable. The verification phase can check not just "does it work now" but "was each step done properly."
4. **Gate-based advancement skill**: Users can invoke the `/forge:advance` user-invoked skill, which checks all gates for the current phase and either advances or reports what's blocking.
5. **Workflow resumption**: Because state is in `.forge/`, a new session can pick up exactly where the last one left off, including mid-execution task progress.

---

## 5. Naming Convention

### Plugin Name
**Forge** -- evokes construction, shaping, crafting. A forge is where raw material becomes something refined through heat and pressure (iterative phases with gates).

### Skill Names
Skills are named as **verb-noun pairs** describing what the skill does, not what role it plays:

| Skill | Name | NOT |
|-------|------|-----|
| Ideation/Discovery | `discover-intent` | ~~office-hours~~, ~~brainstorming~~ |
| Architecture/Design | `shape-design` | ~~plan-ceo-review~~, ~~plan-eng-review~~ |
| Planning | `chart-tasks` | ~~write-plan~~, ~~plan~~ |
| Execution orchestration | `drive-execution` | ~~execute-plan~~, ~~subagent-driven-development~~ |
| Test-first development | `prove-first` | ~~tdd-workflow~~, ~~test-driven-development~~ |
| Code review | `inspect-work` | ~~review~~, ~~requesting-code-review~~ |
| Verification | `confirm-complete` | ~~verification-before-completion~~ |
| Integration | `land-changes` | ~~ship~~, ~~finishing-a-development-branch~~ |
| Debugging | `trace-fault` | ~~investigate~~, ~~systematic-debugging~~ |
| Retrospective | `distill-lessons` | ~~retro~~ |

### Agent Names
Agents are named as **noun-specialist** describing their capability:

| Agent | Name |
|-------|------|
| Spec analysis | `spec-analyst` |
| Task decomposition | `task-decomposer` |
| Implementation | `implementer` |
| Quality audit | `quality-auditor` |
| Security analysis | `security-sentinel` |
| Test strategy | `test-strategist` |
| Impact analysis | `dependency-mapper` |
| Integration testing | `integration-verifier` |
| Documentation | `doc-synthesizer` |

### Command Names
Commands are named as **single imperative verbs**:

| Command | Name | Purpose |
|---------|------|---------|
| Start workflow | `start` | Initiate a new Forge workflow |
| Check status | `status` | Show current phase, progress, gates |
| Advance phase | `advance` | Check gates and progress to next phase |
| Run audit | `audit` | Quality/security/completeness check |

### File Conventions
- Specs: `docs/forge/specs/<topic>-design.md`
- Plans: `docs/forge/plans/<topic>-plan.md`
- State: `.forge/forge-state.json`
- Evidence: `.forge/evidence/<phase>/<artifact>`
