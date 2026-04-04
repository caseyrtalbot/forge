#!/usr/bin/env node

// Structural validation: isolate-work/SKILL.md exists and contains
// the required sections with expected content markers.

const fs = require("fs");
const path = require("path");

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (err) {
    results.push({ name, passed: false, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const SKILL_PATH = path.join(
  __dirname,
  "..",
  "skills",
  "isolate-work",
  "SKILL.md"
);

// ---------------------------------------------------------------------------
// File existence
// ---------------------------------------------------------------------------

test("SKILL.md exists", () => {
  assert(fs.existsSync(SKILL_PATH), `File not found: ${SKILL_PATH}`);
});

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

test("SKILL.md has correct frontmatter name", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(content.includes("name: isolate-work"), "Missing frontmatter name: isolate-work");
});

test("SKILL.md has disable-model-invocation: true", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes("disable-model-invocation: true"),
    "Missing disable-model-invocation: true -- this skill is user-invoked only"
  );
});

test("SKILL.md has phase: any", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(content.includes("phase: any"), "Missing phase: any");
});

// ---------------------------------------------------------------------------
// Required sections
// ---------------------------------------------------------------------------

test("SKILL.md has directory selection section", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /directory selection/i.test(content),
    "Missing section about directory selection priority"
  );
});

test("SKILL.md has a HARD-GATE for safety verification", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes("<HARD-GATE>") && content.includes("</HARD-GATE>"),
    "Missing HARD-GATE block for safety verification"
  );
});

test("SKILL.md mentions .gitignore in safety check", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes(".gitignore"),
    "Safety verification must mention .gitignore"
  );
});

test("SKILL.md has a process flow diagram", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes("```dot") && content.includes("digraph"),
    "Missing dot process flow diagram"
  );
});

test("SKILL.md has anti-patterns section", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /## Anti-Patterns/i.test(content),
    "Missing Anti-Patterns section"
  );
});

test("SKILL.md has evidence requirements section", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /## Evidence Requirements/i.test(content),
    "Missing Evidence Requirements section"
  );
});

// ---------------------------------------------------------------------------
// Key content markers
// ---------------------------------------------------------------------------

test("SKILL.md mentions git worktree add command", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes("git worktree add"),
    "Must include the git worktree add command"
  );
});

test("SKILL.md mentions auto-detection of project setup", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes("package.json") && content.includes("Cargo.toml"),
    "Must mention auto-detecting project type from manifest files"
  );
});

test("SKILL.md mentions baseline tests", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /baseline/i.test(content),
    "Must mention running baseline tests for clean state"
  );
});

test("SKILL.md references land-changes for cleanup", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes("land-changes"),
    "Must reference land-changes skill for cleanup"
  );
});

test("SKILL.md mentions forge/ branch naming", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    content.includes("forge/"),
    "Must mention forge/ branch naming convention"
  );
});

// ---------------------------------------------------------------------------
// Line count constraint
// ---------------------------------------------------------------------------

test("SKILL.md is under 110 lines", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  const lineCount = content.split("\n").length;
  assert(lineCount <= 110, `Expected <= 110 lines, got ${lineCount}`);
});

test("SKILL.md is at least 70 lines", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  const lineCount = content.split("\n").length;
  assert(lineCount >= 70, `Expected >= 70 lines, got ${lineCount} -- too sparse`);
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const passed = results.filter((r) => r.passed);
const failed = results.filter((r) => !r.passed);

console.log("\n--- Isolate Work Structure Tests ---\n");

for (const r of results) {
  const icon = r.passed ? "PASS" : "FAIL";
  console.log(`  ${icon}  ${r.name}`);
  if (!r.passed) console.log(`         ${r.error}`);
}

console.log(`\n  ${passed.length} passed, ${failed.length} failed\n`);

process.exit(failed.length > 0 ? 1 : 0);
