#!/usr/bin/env node

// Forge: Session Capture Hook (Stop)
// Saves current workflow state for cross-session continuity.
// Runs async so it does not delay the session ending.
// Uses FORGE_HOOK_PROFILE to determine if this hook should run.

const fs = require("fs");
const path = require("path");

function main() {
  try {
    // Check runtime profile (session-capture runs in all profiles)
    const disabled = (process.env.FORGE_DISABLED_HOOKS || "").split(",");
    if (disabled.includes("session-capture")) {
      process.exit(0);
    }

    const cwd = process.cwd();
    const statePath = path.join(cwd, ".forge", "forge-state.json");

    if (!fs.existsSync(statePath)) {
      // No active workflow, nothing to capture
      process.exit(0);
    }

    // Read current state and create updated copy (immutable pattern)
    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));

    const updated = {
      ...state,
      last_session: new Date().toISOString(),
      session_count: (state.session_count || 0) + 1,
    };

    // Write updated state
    fs.writeFileSync(statePath, JSON.stringify(updated, null, 2), "utf-8");

    process.stderr.write("[Forge] Session state saved.\n");
    process.exit(0);
  } catch (err) {
    // Graceful failure: log warning, never block
    process.stderr.write(
      `[Forge] session-capture warning: ${err.message}\n`
    );
    process.exit(0);
  }
}

main();
