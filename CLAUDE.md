# Forge Plugin — Project Instructions

This is the canonical always-on context file for the Forge plugin. It consolidates rules that apply to all work done in this project.

---

## Workflow

### Phase-Locked Development

Forge enforces a six-phase workflow: Discovery, Design, Planning, Execution, Verification, Integration. Each phase must complete before the next begins. Evidence gates prevent skipping phases.

### Phase Awareness

Before taking action, check the current workflow phase in `.forge/forge-state.json`. If a workflow is active:

- **Discovery/Design/Planning**: Do not write implementation code. Focus on refining the idea, creating the spec, or decomposing into tasks.
- **Execution**: Implement tasks from the plan. Follow test-first discipline. Review each task before marking complete.
- **Verification**: Run full test suite, build, and security scan. Collect evidence before claiming completion.
- **Integration**: Land the code via the user's chosen method (merge, PR, keep, discard).

### Skill Selection

Forge skills are organized in three tiers. Tiering controls how skills are surfaced, not when they apply.

**Tier 1 -- Unconditional Discipline**
These three skills apply to ALL implementation and debugging work. No exceptions. No "this is too simple" override. Check their triggers on every task:

- **prove-first**: Any new production code or bugfix (except config/types/assets)
- **trace-fault**: Any bug, test failure, or unexpected behavior
- **confirm-complete**: Any claim that work is done

**Tier 2 -- Intent-Matched Process**
These skills activate when their description matches the current task. Claude's native skill matching handles selection. Do not invoke these preemptively:

discover-intent, shape-design, chart-tasks, drive-execution, inspect-work, land-changes, distill-lessons, receive-feedback

**Tier 3 -- User-Invoked Only**
Available via `/forge:isolate-work`. Never auto-invoked.

**Priority when multiple skills match:**
Process skills first (discover-intent, trace-fault), then implementation skills (prove-first, drive-execution). Discipline skills (Tier 1) layer on top of any active process or implementation skill.

### State Management

Workflow state lives in `.forge/forge-state.json` in the project directory. This file:
- Tracks the current phase and completed phases
- Records evidence collected at each gate
- Persists across sessions (the session-capture hook updates it on exit)
- Should never be manually edited outside of Forge skills and hooks

### File Conventions

- Specs: `docs/forge/specs/YYYY-MM-DD-<topic>-design.md`
- Plans: `docs/forge/plans/YYYY-MM-DD-<topic>-plan.md`
- Evidence: `.forge/evidence/<phase>/<artifact>`
- State: `.forge/forge-state.json`

---

## Quality Standards

### Test-First Development

Write the test before writing the code. Run the test and confirm it fails for the expected reason. Write the minimal implementation. Confirm the test passes. This applies to all new functionality and bug fixes. Exceptions: configuration files, type definitions, static assets.

### Evidence Over Assertions

Never claim work is complete without showing the output that proves it. "The tests pass" requires the test output. "The build succeeds" requires the build output. Run the command, capture the result, present the result.

### Code Review

Every implemented task gets reviewed before being marked complete. Reviews cover three dimensions:
1. Spec compliance (does it match what was planned?)
2. Code quality (is it readable, well-structured, and maintainable?)
3. Security (is it safe from common vulnerabilities?)

Categorize findings by severity: Critical (must fix), Important (should fix), Suggestion (note for future).

### Commit Discipline

Commit after each working task, not after all tasks. Each commit should represent one coherent change that passes its verification criteria. Use conventional commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`.

---

## Safety Guardrails

### Destructive Operations

Before running destructive commands (rm -rf, DROP TABLE, git push --force, git reset --hard), pause and consider whether a safer alternative exists. Prefer reversible operations. When destructive operations are necessary, confirm with the user first.

### Secrets

Never hardcode API keys, passwords, tokens, or credentials in source code. Use environment variables. If you encounter hardcoded secrets in existing code, flag them immediately.

### Input Validation

Validate all user input at system boundaries (API endpoints, form submissions, CLI arguments). Use parameterized queries for database operations. Escape output appropriately for the context (HTML, SQL, shell).

### Error Handling

Handle errors at the appropriate level. Do not swallow errors silently. Do not expose internal details (stack traces, file paths, SQL queries) in user-facing error messages. Log errors with enough context to diagnose the problem.

### Scope Discipline

Only modify files that the current task requires. Do not make "while I'm here" changes to unrelated code. Do not add features not in the spec. Do not refactor code that is not part of the current plan.

---

## Agent Collaboration

### Fresh Agents Per Task

Dispatch a fresh agent instance for each task. Do not reuse agents across tasks. Fresh agents prevent context pollution and ensure each task gets focused attention.

### Agent Context

When delegating work to a subagent, provide precise context: the specific task, relevant file paths, success criteria, and scope boundaries. Do not dump the entire project history. Construct exactly what the agent needs.

### Review Before Trust

Do not blindly accept agent output. Review the agent's work before acting on it. Check that the output matches the expected format, addresses the task, and does not contain hallucinated information.

### Parallel Dispatch

When tasks are independent (no shared state, no sequential dependencies), dispatch agents in parallel. When tasks depend on each other, dispatch sequentially.

### Model Routing

Use opus for all agent tasks. No exceptions.

## Compact Instructions

Always preserve:
- Current Forge phase, gate conditions, and evidence collected
- Active spec and plan file paths with completion status
- Phase transition decisions and their rationale
- Hook behavior changes and their trigger conditions
- MCP server state and tool definitions
- Error corrections, especially around phase gate validation
