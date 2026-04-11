# Contributing to Forge

## Adding a Skill

1. Create a directory under `skills/<skill-name>/`
2. Create `SKILL.md` with YAML frontmatter:
   - `name` (required): lowercase, hyphens, max 64 chars
   - `description` (required): under 250 chars, starts with trigger condition, third person
   - `phase`: which workflow phase (discovery/design/planning/execution/verification/integration/any)
   - `transitions`: array of `{target, condition}` defining where the skill goes next
   - `gates`: `{entry, exit}` defining what must be true to enter/leave
   - `context: fork` (optional): run in isolated subagent context
   - `disable-model-invocation: true` (optional): user-invoked only
3. Include in the skill body:
   - HARD-GATE block (non-negotiable enforcement)
   - Process flow diagram (dot format)
   - Checklist (numbered steps)
   - Anti-patterns (common mistakes with explanations)
   - Evidence requirements
   - Transition section
4. Keep SKILL.md under 500 lines. Use supporting `.md` files for reference material.
5. Follow the structure of existing skills as a template.

## Adding an Agent

1. Create `agents/<agent-name>.md` with YAML frontmatter:
   - `name`, `description`, `tools` (array), `model: opus`, `effort: max`
   - `skills` (optional): array of forge skills the agent should follow
2. Include in the body:
   - Role statement (one sentence)
   - "What You Do" section (numbered steps)
   - "What You Do NOT Do" section (scope boundaries)
   - Output format (structured markdown template)
   - Input/output contracts
3. Verify the agent does not overlap with existing agents' scope.

## Adding a Hook

1. Add the hook script to `scripts/hooks/<hook-name>.cjs`
2. Register it in `hooks/hooks.json` under the appropriate event
3. Support runtime profiles (check `FORGE_HOOK_PROFILE` and `FORGE_DISABLED_HOOKS`)
4. Use Node.js for cross-platform compatibility
5. Always exit 0 on error (graceful failure, never block the user)
6. Use `${CLAUDE_PLUGIN_ROOT}` for paths, never hardcode
7. Add test fixtures in `tests/fixtures/` and test cases in `tests/run-tests.cjs`

## Skill Tier Assignment

When adding a skill, determine its tier:

| Tier | Criteria | Frontmatter |
|------|----------|-------------|
| **1 (Unconditional)** | Applies to ALL work, no exceptions | Default (no special fields) |
| **2 (Intent-matched)** | Activates when description matches task | Default (no special fields) |
| **3 (User-invoked)** | Only when user types the command | `disable-model-invocation: true` |

Update the Skill Selection section in `CLAUDE.md` when adding Tier 1 or Tier 2 skills.

## Code Standards

- All hook scripts: Node.js (`.cjs`), cross-platform, graceful failure
- All paths: use `${CLAUDE_PLUGIN_ROOT}` or `process.cwd()`, never hardcode
- All skills: must have HARD-GATE, process flow diagram, and anti-patterns
- All agents: must have scope boundaries ("What You Do NOT Do")
- All agents: `model: opus`, `effort: max`
- Sanitize any stdin-sourced data before writing to files
- No em dashes in any content (use commas, colons, or restructure)

## Testing

```bash
# Run hook tests
npm test

# Run skill content tests
node tests/run-skill-content-tests.cjs
node tests/skill-receive-feedback-structure.cjs
node tests/skill-techniques-structure.cjs
node tests/isolate-work-structure.cjs
```

When adding a skill, add structural validation tests that verify:
- File exists with correct frontmatter
- Required sections present (HARD-GATE, process flow, anti-patterns, evidence, transitions)
- Content matches specification (key terms, section ordering)
