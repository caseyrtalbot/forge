---
name: advance
description: "Check gate conditions for the current phase and advance to the next phase if all pass."
---
Check all gate conditions for the current phase and advance to the next phase if they pass.

## Usage
`/forge:advance`

## Process
1. Read `.forge/forge-state.json` for current phase
2. Evaluate all exit gate conditions for the current phase
3. If all gates pass: update state to next phase, invoke the next phase's skill
4. If any gate fails: report which gates failed and what evidence is missing
