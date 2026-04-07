#!/usr/bin/env node

// Forge: Phase Gate Hook (PreToolUse on Write/Edit)
// Prevents code file edits when the current workflow phase is
// discovery, design, or planning. Allows edits to spec/plan/doc files.
// Uses FORGE_HOOK_PROFILE to determine if this hook should run.

const fs = require("fs");
const path = require("path");

function main() {
  try {
    // Check runtime profile
    const profile = process.env.FORGE_HOOK_PROFILE || "standard";
    if (profile === "minimal") {
      process.exit(0);
    }
    const disabled = (process.env.FORGE_DISABLED_HOOKS || "").split(",");
    if (disabled.includes("phase-gate")) {
      process.exit(0);
    }

    // Read stdin for tool input
    let input = "";
    try {
      input = fs.readFileSync(0, "utf-8");
    } catch {
      // No stdin available, allow
      process.exit(0);
    }

    const toolInput = JSON.parse(input);

    // Only gate code files, not docs/specs/plans/configs
    const docPatterns = [
      /\.md$/i,
      /\.txt$/i,
      /\.json$/i,
      /\.yaml$/i,
      /\.yml$/i,
      /\.toml$/i,
      /docs\//i,
      /\.forge\//i,
      /forge-state/i,
    ];

    const isDocPath = (p) => docPatterns.some((re) => re.test(p));

    // Handle MultiEdit: extract all file paths from edits array
    const edits = toolInput.tool_input?.edits;
    if (Array.isArray(edits) && edits.length > 0) {
      const filePaths = edits.map(e => e.file_path || e.path || "").filter(Boolean);
      const hasCodeFile = filePaths.some(p => !isDocPath(p));
      if (!hasCodeFile) {
        // All targets are doc/config files, allow
        process.exit(0);
      }
      // At least one code file targeted — fall through to phase check
    } else {
      // Single-file tools (Write/Edit)
      const filePath = toolInput.tool_input?.file_path || toolInput.tool_input?.path || "";
      if (isDocPath(filePath)) {
        // Always allow doc/config file edits
        process.exit(0);
      }
    }

    // Check workflow state
    const cwd = process.cwd();
    const statePath = path.join(cwd, ".forge", "forge-state.json");

    if (!fs.existsSync(statePath)) {
      // No active workflow, no gate to enforce
      process.exit(0);
    }

    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    const phase = state.current_phase || "";

    // Block code edits during pre-execution phases
    const blockedPhases = ["discovery", "design", "planning"];
    if (blockedPhases.includes(phase)) {
      // Exit code 2 = block with message
      const output = JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `[Forge] Phase gate: code edits are not allowed during the ${phase} phase. Complete ${phase} first, then advance to execution.`
        }
      });
      process.stdout.write(output);
      process.exit(0);
    }

    // Allow in execution, verification, integration phases
    process.exit(0);
  } catch (err) {
    // Graceful failure: log warning, never block
    process.stderr.write(`[Forge] phase-gate warning: ${err.message}\n`);
    process.exit(0);
  }
}

main();
