Initiate a new Forge workflow. Checks for existing workflow state in `.forge/`, creates a new workflow if none exists, and activates the discover-intent skill to begin collaborative refinement of what to build.

## Usage
`/forge:start [description]`

## Process
1. Check `.forge/forge-state.json` for existing workflow
2. If active workflow exists, show status and ask whether to resume or start fresh
3. Create `.forge/` directory and initialize `forge-state.json`
4. Invoke the `discover-intent` skill
