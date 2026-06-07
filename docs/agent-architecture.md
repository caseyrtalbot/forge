# Forge Agent Architecture

## Frontmatter Schema

```yaml
---
name: <kebab-case-identifier>
description: "<when to deploy this agent and what it does>"
tools: ["Read", "Write", ...]    # Restricted tool access
model: opus                       # All agents use opus
effort: max
---
```

## Model Routing Rules

All nine agents run on `model: opus` with `effort: max`. Every Forge agent
task (spec analysis, decomposition, implementation, review, security,
testing, integration, dependency mapping, documentation) requires deep
judgment and full context, so there is no lighter-model tier.

## Agent Dispatch Rules

- Skills dispatch agents, not users directly (except via the user-invoked `/forge:audit` skill)
- Each agent receives precise context: task description, relevant files, success criteria
- Agents are stateless: fresh instance per dispatch, no session history inheritance
- The orchestrating skill reviews agent output before acting on it

## Review Tiers

| Tier | Pattern | Used By |
|------|---------|---------|
| Single-pass | One agent reviews once | dependency-mapper, doc-synthesizer |
| Two-stage | Spec compliance then code quality | quality-auditor (combines both stages) |
| Multi-agent | Multiple specialists in parallel | `/forge:audit` user-invoked skill (quality + security + integration) |

## Scope Boundaries

Every agent has explicit scope boundaries defining what it does NOT do. This prevents agents from expanding beyond their mandate and stepping on each other's responsibilities.
