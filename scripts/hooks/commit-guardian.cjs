#!/usr/bin/env node

// Forge: Commit Guardian Hook (PreToolUse on Bash)
// Validates that verification has passed before allowing git commits.
// Only intercepts commands containing "git commit".
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
    if (disabled.includes("commit-guardian")) {
      process.exit(0);
    }

    // Read stdin for tool input
    let input = "";
    try {
      input = fs.readFileSync(0, "utf-8");
    } catch {
      process.exit(0);
    }

    const toolInput = JSON.parse(input);
    const command = toolInput.tool_input?.command || "";

    // Only intercept git commit commands
    if (!/git\s+commit/i.test(command)) {
      process.exit(0);
    }

    // Check if we are in a Forge workflow with verification requirements
    const cwd = process.cwd();
    const statePath = path.join(cwd, ".forge", "forge-state.json");

    if (!fs.existsSync(statePath)) {
      // No active workflow, allow commit
      process.exit(0);
    }

    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    const phase = state.current_phase || "";

    // During execution phase, check if the current task has been verified
    // During other phases, allow commits (docs, specs, plans)
    if (phase === "execution") {
      // Check for test evidence
      const testEvidence = path.join(
        cwd,
        ".forge",
        "evidence",
        "verification",
        "test-results.txt"
      );
      if (!fs.existsSync(testEvidence)) {
        // Warn but do not block during execution (per-task commits are expected)
        process.stderr.write(
          "[Forge] Commit guardian: no test evidence found. Consider running tests before committing.\n"
        );
      }
    }

    // During verification phase, require evidence before final commits
    if (phase === "verification") {
      const evidenceDir = path.join(
        cwd,
        ".forge",
        "evidence",
        "verification"
      );
      const hasTestResults =
        fs.existsSync(path.join(evidenceDir, "test-results.txt"));
      const hasBuildResults =
        fs.existsSync(path.join(evidenceDir, "build-results.txt"));

      if (!hasTestResults && !hasBuildResults) {
        const output = JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "[Forge] Commit guardian: verification phase requires test or build evidence before committing. Run your test suite first."
          }
        });
        process.stdout.write(output);
        process.exit(0);
      }
    }

    process.exit(0);
  } catch (err) {
    // Graceful failure: log warning, never block
    process.stderr.write(
      `[Forge] commit-guardian warning: ${err.message}\n`
    );
    process.exit(0);
  }
}

main();
