#!/usr/bin/env node

// Forge: Session Initialization Hook (SessionStart)
// Loads workflow state from .forge/forge-state.json and presents status.
// Uses FORGE_HOOK_PROFILE to determine if this hook should run.

const fs = require("fs");
const path = require("path");

function main() {
  try {
    // Check if this hook is disabled
    const disabled = (process.env.FORGE_DISABLED_HOOKS || "").split(",");
    if (disabled.includes("session-init")) {
      process.exit(0);
    }

    // Look for .forge/forge-state.json in current working directory
    const cwd = process.cwd();
    const statePath = path.join(cwd, ".forge", "forge-state.json");

    if (!fs.existsSync(statePath)) {
      // No active workflow -- nothing to report
      process.exit(0);
    }

    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    const phase = state.current_phase || "unknown";
    const completed = (state.phases_completed || []).length;
    const totalTasks = state.total_tasks || 0;
    const currentTask = state.current_task || 0;

    // Build status message for Claude's context via stdout
    const lines = [
      "[Forge] Active workflow detected",
      `  Phase: ${phase}`,
      `  Completed phases: ${completed}/6`,
    ];

    if (phase === "execution" && totalTasks > 0) {
      lines.push(`  Task progress: ${currentTask}/${totalTasks}`);
    }

    if (state.workflow_id) {
      lines.push(`  Workflow: ${state.workflow_id}`);
    }

    const context = JSON.stringify({
      additionalContext: lines.join("\n")
    });
    process.stdout.write(context);
    process.exit(0);
  } catch (err) {
    // Graceful failure: log warning, never block
    process.stderr.write(`[Forge] session-init warning: ${err.message}\n`);
    process.exit(0);
  }
}

main();
