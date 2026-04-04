#!/usr/bin/env node

// Structural validation: trace-fault/techniques.md exists and contains
// the four required technique sections with expected content markers.

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

const TECHNIQUES_PATH = path.join(
  __dirname,
  "..",
  "skills",
  "trace-fault",
  "techniques.md"
);

test("techniques.md exists", () => {
  assert(fs.existsSync(TECHNIQUES_PATH), `File not found: ${TECHNIQUES_PATH}`);
});

test("techniques.md has all four technique headings", () => {
  const content = fs.readFileSync(TECHNIQUES_PATH, "utf-8");
  const required = [
    "## 1. Defense-in-Depth",
    "## 2. Condition-Based Waiting",
    "## 3. Parallel Investigation",
    "## 4. Architecture Questioning",
  ];
  for (const heading of required) {
    assert(content.includes(heading), `Missing section: ${heading}`);
  }
});

test("techniques.md has a concrete code example", () => {
  const content = fs.readFileSync(TECHNIQUES_PATH, "utf-8");
  assert(content.includes("```"), "No code blocks found -- needs concrete examples");
});

test("techniques.md references trace-fault", () => {
  const content = fs.readFileSync(TECHNIQUES_PATH, "utf-8");
  assert(
    content.includes("trace-fault"),
    "Should reference trace-fault in the header"
  );
});

test("techniques.md is under 120 lines", () => {
  const content = fs.readFileSync(TECHNIQUES_PATH, "utf-8");
  const lineCount = content.split("\n").length;
  assert(lineCount <= 120, `Expected <= 120 lines, got ${lineCount}`);
});

test("techniques.md mentions when NOT to use parallel investigation", () => {
  const content = fs.readFileSync(TECHNIQUES_PATH, "utf-8");
  assert(
    /not.*use|don.*use|when not/i.test(content),
    "Should include guidance on when NOT to use parallel investigation"
  );
});

// Report
const passed = results.filter((r) => r.passed);
const failed = results.filter((r) => !r.passed);

console.log("\n--- Techniques Structure Tests ---\n");

for (const r of results) {
  const icon = r.passed ? "PASS" : "FAIL";
  console.log(`  ${icon}  ${r.name}`);
  if (!r.passed) console.log(`         ${r.error}`);
}

console.log(`\n  ${passed.length} passed, ${failed.length} failed\n`);

process.exit(failed.length > 0 ? 1 : 0);
