#!/usr/bin/env node

// Forge: Phase Gate Hook (PreToolUse on Write/Edit/MultiEdit/Bash)
// Prevents code file edits when the current workflow phase is
// discovery, design, or planning. Allows edits to spec/plan/doc/config
// files. For Bash, gates only commands that write code files via
// redirection/tee/sed (e.g. `echo ... > app.ts`); routine commands pass.
// Uses FORGE_HOOK_PROFILE to determine if this hook should run.

const fs = require("fs");
const path = require("path");

// Source-code file extensions. Config (.json/.yaml/.toml) and docs (.md)
// are intentionally NOT here: Forge treats config and docs as editable
// during pre-execution phases.
const CODE_EXT =
  "(?:ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|rb|php|c|cc|cpp|cxx|h|hpp|cs|swift|kt|kts|scala|sh|bash|zsh|sql|vue|svelte|lua|pl|dart|ex|exs|erl|clj)";

// Detect Bash commands that write a code file via redirection, tee, or sed -i.
// Conservative by design: matches only an unambiguous write to a code-file
// target, so routine commands (npm test, git status, ls) are never gated.
function isBashCodeWrite(command) {
  const patterns = [
    new RegExp(">>?\\s*['\"]?[^\\s'\"|&;<>]+\\." + CODE_EXT + "\\b", "i"),
    new RegExp("\\btee\\s+(?:-a\\s+)?['\"]?[^\\s'\"|&;]+\\." + CODE_EXT + "\\b", "i"),
    new RegExp("\\bsed\\s+-i\\b[^|&;]*\\." + CODE_EXT + "\\b", "i"),
  ];
  return patterns.some((re) => re.test(command));
}

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

    const toolName = toolInput.tool_name || "";
    const ti = toolInput.tool_input || {};

    if (toolName === "Bash" || (ti.command && !ti.file_path && !ti.edits)) {
      // Bash: gate only commands that write code files. Anything else passes.
      if (!isBashCodeWrite(ti.command || "")) {
        process.exit(0);
      }
      // It is a code-writing command — fall through to phase check.
    } else if (Array.isArray(ti.edits) && ti.edits.length > 0) {
      // MultiEdit: extract all file paths from the edits array
      const filePaths = ti.edits.map(e => e.file_path || e.path || "").filter(Boolean);
      const hasCodeFile = filePaths.some(p => !isDocPath(p));
      if (!hasCodeFile) {
        // All targets are doc/config files, allow
        process.exit(0);
      }
      // At least one code file targeted — fall through to phase check
    } else {
      // Single-file tools (Write/Edit)
      const filePath = ti.file_path || ti.path || "";
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
      // Block with a permission decision (deny) on stdout, exit 0.
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
