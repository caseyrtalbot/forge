#!/usr/bin/env node

// Forge: Commit Guardian Hook (PreToolUse on Bash)
// Validates that verification has passed before allowing git commits.
// Only intercepts commands containing "git commit".
// Uses FORGE_HOOK_PROFILE to determine if this hook should run.

const fs = require("fs");
const path = require("path");

// Check if an evidence file contains Status: PASS
function evidencePasses(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return /^Status:\s*PASS/m.test(content);
  } catch {
    return false;
  }
}

// Determine why evidence failed for clear deny messages
function evidenceFailReason(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const match = content.match(/^Status:\s*(\S+)/m);
    if (!match) return "no Status field in evidence file";
    return `tests ${match[1] === "FAIL" ? "failed" : "have unknown status"} (Status: ${match[1]})`;
  } catch {
    return "could not read evidence file";
  }
}

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

    // During execution phase, require fresh PASSING test evidence before committing.
    // "Fresh" = evidence file modified within the last 30 minutes.
    // "Passing" = evidence file contains "Status: PASS".
    // This enforces per-task testing: stale or failing evidence won't pass.
    if (phase === "execution") {
      const execEvidenceDir = path.join(cwd, ".forge", "evidence", "verification");
      const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
      let hasFreshPassingEvidence = false;
      let hasFreshFailingEvidence = false;
      let latestFailPath = null;

      if (fs.existsSync(execEvidenceDir)) {
        const files = fs.readdirSync(execEvidenceDir)
          .filter(f => f.startsWith("test-results"))
          .map(f => {
            const fullPath = path.join(execEvidenceDir, f);
            const stat = fs.statSync(fullPath);
            return { name: f, path: fullPath, mtimeMs: stat.mtimeMs };
          })
          .filter(f => f.mtimeMs > thirtyMinAgo)
          .sort((a, b) => b.mtimeMs - a.mtimeMs);

        for (const f of files) {
          if (evidencePasses(f.path)) {
            hasFreshPassingEvidence = true;
            break;
          } else {
            hasFreshFailingEvidence = true;
            if (!latestFailPath) latestFailPath = f.path;
          }
        }
      }

      if (!hasFreshPassingEvidence) {
        let reason;
        if (hasFreshFailingEvidence) {
          const detail = evidenceFailReason(latestFailPath);
          reason = `[Forge] Commit guardian: fresh test evidence exists but ${detail}. Fix the failing tests before committing.`;
        } else {
          reason = "[Forge] Commit guardian: execution phase requires fresh passing test evidence before committing. Run your test suite first. Evidence older than 30 minutes is considered stale.";
        }
        const output = JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: reason
          }
        });
        process.stdout.write(output);
        process.exit(0);
      }
    }

    // During verification phase, require PASSING test AND build evidence
    if (phase === "verification") {
      const evidenceDir = path.join(cwd, ".forge", "evidence", "verification");
      let testPasses = false;
      let buildPasses = false;
      let testFailReason = "no test evidence found";
      let buildFailReason = "no build evidence found";

      if (fs.existsSync(evidenceDir)) {
        const files = fs.readdirSync(evidenceDir);

        // Find most recent test evidence
        const testFiles = files
          .filter(f => f.startsWith("test-results"))
          .map(f => ({ name: f, path: path.join(evidenceDir, f), mtimeMs: fs.statSync(path.join(evidenceDir, f)).mtimeMs }))
          .sort((a, b) => b.mtimeMs - a.mtimeMs);

        if (testFiles.length > 0) {
          testPasses = evidencePasses(testFiles[0].path);
          if (!testPasses) {
            testFailReason = evidenceFailReason(testFiles[0].path);
          }
        }

        // Find most recent build evidence
        const buildFiles = files
          .filter(f => f.startsWith("build-results"))
          .map(f => ({ name: f, path: path.join(evidenceDir, f), mtimeMs: fs.statSync(path.join(evidenceDir, f)).mtimeMs }))
          .sort((a, b) => b.mtimeMs - a.mtimeMs);

        if (buildFiles.length > 0) {
          buildPasses = evidencePasses(buildFiles[0].path);
          if (!buildPasses) {
            buildFailReason = evidenceFailReason(buildFiles[0].path);
          }
        }
      }

      if (!testPasses || !buildPasses) {
        const reasons = [];
        if (!testPasses) reasons.push(`Tests: ${testFailReason}`);
        if (!buildPasses) reasons.push(`Build: ${buildFailReason}`);
        const output = JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: `[Forge] Commit guardian: verification phase requires passing test AND build evidence. ${reasons.join(". ")}.`
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
