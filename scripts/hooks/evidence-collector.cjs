#!/usr/bin/env node

// Forge: Evidence Collector Hook (PostToolUse on Bash)
// Captures test results and build outputs as verification evidence.
// Writes captured output to .forge/evidence/ directory.
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
    if (disabled.includes("evidence-collector")) {
      process.exit(0);
    }

    // Read stdin for tool result
    let input = "";
    try {
      input = fs.readFileSync(0, "utf-8");
    } catch {
      process.exit(0);
    }

    const toolResult = JSON.parse(input);
    const command = toolResult.tool_input?.command || "";
    const output = toolResult.tool_response?.stdout || toolResult.tool_response?.output || "";

    // Only capture evidence for test/build commands
    const testPatterns = [
      /npm test/i,
      /yarn test/i,
      /pnpm test/i,
      /bun test/i,
      /jest/i,
      /vitest/i,
      /pytest/i,
      /go test/i,
      /cargo test/i,
    ];

    const buildPatterns = [
      /npm run build/i,
      /yarn build/i,
      /pnpm build/i,
      /bun run build/i,
      /tsc/i,
      /cargo build/i,
      /go build/i,
    ];

    const isTest = testPatterns.some((p) => p.test(command));
    const isBuild = buildPatterns.some((p) => p.test(command));

    if (!isTest && !isBuild) {
      process.exit(0);
    }

    // Write evidence
    const cwd = process.cwd();
    const evidenceDir = path.join(cwd, ".forge", "evidence", "verification");

    // Create evidence directory if it does not exist
    fs.mkdirSync(evidenceDir, { recursive: true });

    const filename = isTest ? "test-results.txt" : "build-results.txt";
    const evidencePath = path.join(evidenceDir, filename);

    // Sanitize stdin-sourced values before writing to disk
    const sanitize = (str, maxLen) =>
      String(str)
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
        .substring(0, maxLen);

    const safeCommand = sanitize(command, 500);
    const safeOutput = sanitize(output, 10000);

    const timestamp = new Date().toISOString();
    const content = [
      `# ${isTest ? "Test" : "Build"} Results`,
      `Captured: ${timestamp}`,
      `Command: ${safeCommand}`,
      "",
      "## Output",
      safeOutput,
      "",
    ].join("\n");

    fs.writeFileSync(evidencePath, content, "utf-8");
    process.stderr.write(
      `[Forge] Evidence captured: ${filename}\n`
    );
    process.exit(0);
  } catch (err) {
    // Graceful failure: log warning, never block
    process.stderr.write(
      `[Forge] evidence-collector warning: ${err.message}\n`
    );
    process.exit(0);
  }
}

main();
