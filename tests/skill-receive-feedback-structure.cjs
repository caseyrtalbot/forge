#!/usr/bin/env node

// Structural validation: receive-feedback/SKILL.md exists and contains
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
  "receive-feedback",
  "SKILL.md"
);

// ---------------------------------------------------------------------------
// File existence and frontmatter
// ---------------------------------------------------------------------------

test("SKILL.md exists", () => {
  assert(fs.existsSync(SKILL_PATH), `File not found: ${SKILL_PATH}`);
});

test("SKILL.md has valid frontmatter with required fields", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(content.startsWith("---"), "Must start with YAML frontmatter delimiter");
  const endDelim = content.indexOf("---", 3);
  assert(endDelim > 3, "Must have closing YAML frontmatter delimiter");
  const frontmatter = content.slice(3, endDelim);
  assert(frontmatter.includes("name: receive-feedback"), "Missing name field");
  assert(frontmatter.includes("phase: any"), "Missing phase: any");
  assert(frontmatter.includes("target: prove-first"), "Missing transition to prove-first");
  assert(frontmatter.includes("entry:"), "Missing entry gate");
  assert(frontmatter.includes("exit:"), "Missing exit gate");
});

// ---------------------------------------------------------------------------
// HARD-GATE
// ---------------------------------------------------------------------------

test("SKILL.md has a HARD-GATE block", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(content.includes("<HARD-GATE>"), "Missing <HARD-GATE> opening tag");
  assert(content.includes("</HARD-GATE>"), "Missing </HARD-GATE> closing tag");
});

test("HARD-GATE mentions verification before implementation", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  const gateStart = content.indexOf("<HARD-GATE>");
  const gateEnd = content.indexOf("</HARD-GATE>");
  const gateContent = content.slice(gateStart, gateEnd);
  assert(
    /verif/i.test(gateContent),
    "HARD-GATE should mention verification"
  );
  assert(
    /performative/i.test(gateContent),
    "HARD-GATE should mention performative agreement"
  );
});

// ---------------------------------------------------------------------------
// Process flow diagram
// ---------------------------------------------------------------------------

test("SKILL.md has a process flow diagram in dot format", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(content.includes("```dot"), "Missing dot process flow diagram");
  assert(content.includes("digraph"), "Dot diagram should use digraph");
});

// ---------------------------------------------------------------------------
// Six-step process
// ---------------------------------------------------------------------------

test("SKILL.md includes all six process steps", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  const steps = ["READ", "UNDERSTAND", "VERIFY", "EVALUATE", "RESPOND", "IMPLEMENT"];
  for (const step of steps) {
    assert(
      content.includes(step),
      `Missing process step: ${step}`
    );
  }
});

// ---------------------------------------------------------------------------
// Forbidden responses section
// ---------------------------------------------------------------------------

test("SKILL.md has forbidden responses section", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /forbidden.*response/i.test(content),
    "Missing forbidden responses section"
  );
  const forbidden = [
    "You're absolutely right",
    "Great point",
    "Let me implement that now",
  ];
  for (const phrase of forbidden) {
    assert(
      content.includes(phrase),
      `Missing forbidden phrase: "${phrase}"`
    );
  }
});

// ---------------------------------------------------------------------------
// Pushback framework
// ---------------------------------------------------------------------------

test("SKILL.md has pushback framework", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /pushback/i.test(content),
    "Missing pushback section"
  );
  assert(
    /file:line/i.test(content) || /file.*line/i.test(content),
    "Pushback should mention citing file:line references"
  );
  assert(
    /YAGNI/i.test(content),
    "Pushback should include YAGNI check"
  );
});

// ---------------------------------------------------------------------------
// Implementation order
// ---------------------------------------------------------------------------

test("SKILL.md defines implementation priority order", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /critical/i.test(content) && /simple/i.test(content) && /complex/i.test(content),
    "Should define Critical > Simple > Complex ordering"
  );
});

// ---------------------------------------------------------------------------
// Source-specific handling
// ---------------------------------------------------------------------------

test("SKILL.md has source-specific handling for human and agent reviewers", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /human.*reviewer/i.test(content),
    "Should address human reviewer handling"
  );
  assert(
    /agent.*reviewer/i.test(content),
    "Should address agent reviewer handling"
  );
  assert(
    /hallucinate/i.test(content),
    "Should warn about agent hallucination"
  );
});

// ---------------------------------------------------------------------------
// Anti-patterns section
// ---------------------------------------------------------------------------

test("SKILL.md has anti-patterns section", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /anti.?pattern/i.test(content),
    "Missing anti-patterns section"
  );
  // Should have at least three anti-patterns
  const antiPatternMatches = content.match(/\*\*"[^"]+"\*\*/g);
  assert(
    antiPatternMatches && antiPatternMatches.length >= 3,
    `Expected at least 3 anti-patterns in bold-quoted format, found ${antiPatternMatches ? antiPatternMatches.length : 0}`
  );
});

// ---------------------------------------------------------------------------
// Evidence requirements
// ---------------------------------------------------------------------------

test("SKILL.md has evidence requirements section", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /evidence.*requirement/i.test(content),
    "Missing evidence requirements section"
  );
});

// ---------------------------------------------------------------------------
// Transition
// ---------------------------------------------------------------------------

test("SKILL.md has transition section mentioning prove-first", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  assert(
    /## Transition/i.test(content),
    "Missing Transition section heading"
  );
  assert(
    /prove-first/.test(content),
    "Transition should reference prove-first"
  );
});

// ---------------------------------------------------------------------------
// Line count target: approximately 120 lines (allow 90-150)
// ---------------------------------------------------------------------------

test("SKILL.md is between 90 and 150 lines", () => {
  const content = fs.readFileSync(SKILL_PATH, "utf-8");
  const lineCount = content.split("\n").length;
  assert(
    lineCount >= 90 && lineCount <= 150,
    `Expected 90-150 lines, got ${lineCount}`
  );
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const passed = results.filter((r) => r.passed);
const failed = results.filter((r) => !r.passed);

console.log("\n--- Receive-Feedback Skill Structure Tests ---\n");

for (const r of results) {
  const icon = r.passed ? "PASS" : "FAIL";
  console.log(`  ${icon}  ${r.name}`);
  if (!r.passed) console.log(`         ${r.error}`);
}

console.log(`\n  ${passed.length} passed, ${failed.length} failed\n`);

process.exit(failed.length > 0 ? 1 : 0);
