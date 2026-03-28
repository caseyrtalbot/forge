#!/usr/bin/env node

// Forge: Hook Test Runner
// Pipes fixture JSON through hook scripts and asserts on exit codes and output.
// No test framework dependency -- just Node.js child_process and fs.

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const HOOKS_DIR = path.join(__dirname, "..", "scripts", "hooks");
const FIXTURES_DIR = path.join(__dirname, "fixtures");

const HOOKS = {
  phaseGate: path.join(HOOKS_DIR, "phase-gate.cjs"),
  commitGuardian: path.join(HOOKS_DIR, "commit-guardian.cjs"),
  evidenceCollector: path.join(HOOKS_DIR, "evidence-collector.cjs"),
  sessionInit: path.join(HOOKS_DIR, "session-init.cjs"),
  sessionCapture: path.join(HOOKS_DIR, "session-capture.cjs"),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const results = [];
const tempDirs = [];

function makeTempDir(label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `forge-test-${label}-`));
  tempDirs.push(dir);
  return dir;
}

function writeState(dir, state) {
  const forgeDir = path.join(dir, ".forge");
  fs.mkdirSync(forgeDir, { recursive: true });
  fs.writeFileSync(
    path.join(forgeDir, "forge-state.json"),
    JSON.stringify(state, null, 2),
    "utf-8"
  );
}

function readFixture(name) {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), "utf-8");
}

function runHook(hookPath, opts = {}) {
  const { cwd, stdin } = opts;
  return spawnSync("node", [hookPath], {
    cwd: cwd || process.cwd(),
    input: stdin || "",
    encoding: "utf-8",
    timeout: 10000,
  });
}

function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (err) {
    results.push({ name, passed: false, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ---------------------------------------------------------------------------
// Setup: create temp directories with different workflow states
// ---------------------------------------------------------------------------

const discoveryDir = makeTempDir("discovery");
writeState(discoveryDir, { current_phase: "discovery" });

const executionDir = makeTempDir("execution");
writeState(executionDir, { current_phase: "execution" });

const verificationDir = makeTempDir("verification");
writeState(verificationDir, { current_phase: "verification" });
// No evidence files -- commit-guardian should block

const emptyDir = makeTempDir("empty");
// No .forge directory at all

const sessionCountDir = makeTempDir("session-count");
writeState(sessionCountDir, {
  current_phase: "execution",
  session_count: 3,
});

// ---------------------------------------------------------------------------
// Phase Gate Tests
// ---------------------------------------------------------------------------

test("phase-gate: blocks .ts file write during discovery", () => {
  const result = runHook(HOOKS.phaseGate, {
    cwd: discoveryDir,
    stdin: readFixture("pretooluse-write-ts-file.json"),
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);
  assert(
    /permissionDecision.*deny/.test(result.stdout),
    `Expected stdout to contain permissionDecision deny, got: ${result.stdout}`
  );
});

test("phase-gate: allows .md file write during discovery", () => {
  const result = runHook(HOOKS.phaseGate, {
    cwd: discoveryDir,
    stdin: readFixture("pretooluse-write-md-file.json"),
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);
  assert(
    !/deny/.test(result.stdout),
    `Expected no deny in stdout, got: ${result.stdout}`
  );
});

test("phase-gate: allows .ts file write during execution", () => {
  const result = runHook(HOOKS.phaseGate, {
    cwd: executionDir,
    stdin: readFixture("pretooluse-write-ts-file.json"),
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);
  assert(
    !/deny/.test(result.stdout),
    `Expected no deny in stdout, got: ${result.stdout}`
  );
});

// ---------------------------------------------------------------------------
// Commit Guardian Tests
// ---------------------------------------------------------------------------

test("commit-guardian: blocks git commit during verification with no evidence", () => {
  const result = runHook(HOOKS.commitGuardian, {
    cwd: verificationDir,
    stdin: readFixture("pretooluse-bash-git-commit.json"),
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);
  assert(
    /permissionDecision.*deny/.test(result.stdout),
    `Expected stdout to contain permissionDecision deny, got: ${result.stdout}`
  );
});

test("commit-guardian: allows non-commit bash commands", () => {
  const result = runHook(HOOKS.commitGuardian, {
    cwd: verificationDir,
    stdin: readFixture("pretooluse-bash-npm-test.json"),
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);
  assert(
    !/deny/.test(result.stdout),
    `Expected no deny in stdout, got: ${result.stdout}`
  );
});

// ---------------------------------------------------------------------------
// Evidence Collector Tests
// ---------------------------------------------------------------------------

test("evidence-collector: captures test results from npm test", () => {
  const evidenceDir = makeTempDir("evidence-collect");
  // Evidence collector needs a .forge dir to exist (it creates evidence subdir)
  fs.mkdirSync(path.join(evidenceDir, ".forge"), { recursive: true });

  const result = runHook(HOOKS.evidenceCollector, {
    cwd: evidenceDir,
    stdin: readFixture("posttooluse-bash-npm-test.json"),
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);

  const evidencePath = path.join(
    evidenceDir,
    ".forge",
    "evidence",
    "verification",
    "test-results.txt"
  );
  assert(
    fs.existsSync(evidencePath),
    `Expected evidence file at ${evidencePath}`
  );

  const content = fs.readFileSync(evidencePath, "utf-8");
  assert(
    content.includes("npm test"),
    `Expected evidence to contain command, got: ${content}`
  );
});

test("evidence-collector: ignores non-test commands like ls", () => {
  const noEvidenceDir = makeTempDir("no-evidence");
  fs.mkdirSync(path.join(noEvidenceDir, ".forge"), { recursive: true });

  const result = runHook(HOOKS.evidenceCollector, {
    cwd: noEvidenceDir,
    stdin: readFixture("posttooluse-bash-ls.json"),
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);

  const evidencePath = path.join(
    noEvidenceDir,
    ".forge",
    "evidence",
    "verification",
    "test-results.txt"
  );
  assert(
    !fs.existsSync(evidencePath),
    `Expected no evidence file, but found one at ${evidencePath}`
  );
});

// ---------------------------------------------------------------------------
// Session Init Tests
// ---------------------------------------------------------------------------

test("session-init: outputs context when workflow is active", () => {
  const result = runHook(HOOKS.sessionInit, {
    cwd: discoveryDir,
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);
  assert(
    /additionalContext/.test(result.stdout),
    `Expected stdout to contain additionalContext, got: ${result.stdout}`
  );
  assert(
    /discovery/.test(result.stdout),
    `Expected stdout to mention discovery phase, got: ${result.stdout}`
  );
});

test("session-init: silent when no .forge directory", () => {
  const result = runHook(HOOKS.sessionInit, {
    cwd: emptyDir,
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);
  assert(
    result.stdout === "",
    `Expected empty stdout, got: ${result.stdout}`
  );
});

// ---------------------------------------------------------------------------
// Session Capture Tests
// ---------------------------------------------------------------------------

test("session-capture: increments session_count", () => {
  const result = runHook(HOOKS.sessionCapture, {
    cwd: sessionCountDir,
  });
  assert(result.status === 0, `Expected exit 0, got ${result.status}`);

  const state = JSON.parse(
    fs.readFileSync(
      path.join(sessionCountDir, ".forge", "forge-state.json"),
      "utf-8"
    )
  );
  assert(
    state.session_count === 4,
    `Expected session_count 4, got ${state.session_count}`
  );
  assert(
    typeof state.last_session === "string",
    `Expected last_session to be set, got ${state.last_session}`
  );
});

// ---------------------------------------------------------------------------
// Cleanup and Report
// ---------------------------------------------------------------------------

// Clean up temp directories
for (const dir of tempDirs) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup
  }
}

// Report results
const passed = results.filter((r) => r.passed);
const failed = results.filter((r) => !r.passed);

console.log("\n--- Forge Hook Tests ---\n");

for (const r of results) {
  const icon = r.passed ? "PASS" : "FAIL";
  console.log(`  ${icon}  ${r.name}`);
  if (!r.passed) {
    console.log(`         ${r.error}`);
  }
}

console.log(`\n  ${passed.length} passed, ${failed.length} failed\n`);

if (failed.length > 0) {
  console.log("Failing tests:");
  for (const f of failed) {
    console.log(`  - ${f.name}`);
  }
  console.log();
  process.exit(1);
}

process.exit(0);
