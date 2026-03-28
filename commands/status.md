---
name: status
description: "Show current Forge workflow phase, progress, and pending gates."
---
Show the current Forge workflow status including active phase, completed phases, pending gates, and task progress.

## Usage
`/forge:status`

## Process
1. Read `.forge/forge-state.json`
2. Display current phase, completed phases, and evidence collected
3. If in EXECUTION phase, show task progress (N of M complete)
4. List any blocking gate conditions for the next phase
