# Forge Agent Architecture

## Frontmatter Schema

```yaml
---
name: <kebab-case-identifier>
description: "<when to deploy this agent and what it does>"
tools: ["Read", "Write", ...]    # Restricted tool access
model: <opus|sonnet>              # Model routing
---
```

## Model Routing Rules

| Model | When | Rationale |
|-------|------|-----------|
| opus | Reasoning-heavy tasks: spec analysis, quality review, security, implementation, test strategy, integration verification, performance | Needs deep judgment and full context |
| sonnet | Mechanical tasks: dependency mapping, documentation sync | Pattern application, fast turnaround |

## Agent Dispatch Rules

- Skills dispatch agents, not users directly (except via /forge:audit)
- Each agent receives precise context: task description, relevant files, success criteria
- Agents are stateless: fresh instance per dispatch, no session history inheritance
- The orchestrating skill reviews agent output before acting on it

## Review Tiers

| Tier | Pattern | Used By |
|------|---------|---------|
| Single-pass | One agent reviews once | dependency-mapper, doc-synthesizer |
| Two-stage | Spec compliance then code quality | quality-auditor (combines both stages) |
| Multi-agent | Multiple specialists in parallel | /forge:audit command (quality + security + integration) |

## Scope Boundaries

Every agent has explicit scope boundaries defining what it does NOT do. This prevents agents from expanding beyond their mandate and stepping on each other's responsibilities.
