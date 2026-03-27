# Contributing to Forge

## Adding a Skill

1. Create a directory under `skills/<skill-name>/`
2. Create `SKILL.md` with YAML frontmatter (name, description, phase, transitions, gates)
3. Include: hard gate, process flow diagram, checklist, anti-patterns, evidence requirements, transition
4. Follow the structure of existing skills as a template

## Adding an Agent

1. Create `agents/<agent-name>.md` with YAML frontmatter (name, description, tools, model)
2. Include: role statement, "What You Do" section, "What You Do NOT Do" section, output format, I/O contracts
3. Verify the agent does not overlap with existing agents' scope

## Adding a Hook

1. Add the hook script to `scripts/hooks/<hook-name>.js`
2. Register it in `hooks/hooks.json` under the appropriate event
3. Support runtime profiles (check FORGE_HOOK_PROFILE and FORGE_DISABLED_HOOKS)
4. Use Node.js for cross-platform compatibility
5. Always exit 0 on error (graceful failure)
6. Use `${CLAUDE_PLUGIN_ROOT}` for paths, never hardcode

## Adding a Command

1. Create `commands/<command-name>.md` with a description, usage, and process section
2. Command filenames become the slash command name (e.g., `start.md` becomes `/forge:start`)

## Code Standards

- All hook scripts: Node.js, cross-platform, graceful failure
- All paths: use `${CLAUDE_PLUGIN_ROOT}` or `process.cwd()`, never hardcode
- All skills: must have hard gates, process flows, and anti-patterns
- All agents: must have scope boundaries ("What You Do NOT Do")
- Sanitize any stdin-sourced data before writing to files

## Testing Your Changes

1. Install Forge locally: `/plugin install ./path/to/forge`
2. Start a new session and verify your changes work
3. Check that hooks fire correctly
4. Verify skills trigger at the right times
