#!/usr/bin/env node

// Forge: Skill Content Validation Tests
// Verifies that skill reference files exist, contain required sections,
// and follow structural conventions.

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SKILLS_DIR = path.join(__dirname, "..", "skills");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  if (!condition) {
    throw new Error(message);
  }
}

function readSkillFile(skill, filename) {
  const filePath = path.join(SKILLS_DIR, skill, filename);
  assert(fs.existsSync(filePath), `File does not exist: ${filePath}`);
  return fs.readFileSync(filePath, "utf-8");
}

// ---------------------------------------------------------------------------
// inspect-work/reviewer-prompts.md
// ---------------------------------------------------------------------------

test("reviewer-prompts.md: file exists", () => {
  const filePath = path.join(SKILLS_DIR, "inspect-work", "reviewer-prompts.md");
  assert(fs.existsSync(filePath), `Missing: ${filePath}`);
});

test("reviewer-prompts.md: has Spec Compliance Reviewer section", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  assert(
    /## Spec Compliance Reviewer/.test(content),
    "Missing '## Spec Compliance Reviewer' section"
  );
});

test("reviewer-prompts.md: has Code Quality Reviewer section", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  assert(
    /## Code Quality Reviewer/.test(content),
    "Missing '## Code Quality Reviewer' section"
  );
});

test("reviewer-prompts.md: spec reviewer checks requirements coverage", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  assert(
    /requirements/i.test(content),
    "Spec reviewer template should mention checking requirements"
  );
});

test("reviewer-prompts.md: spec reviewer checks scope creep", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  assert(
    /scope creep|extra.*feature|unneeded|not.*requested/i.test(content),
    "Spec reviewer template should check for scope creep"
  );
});

test("reviewer-prompts.md: spec reviewer explicitly excludes code quality", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  const specSection = content.split("## Code Quality Reviewer")[0];
  assert(
    /do not.*(?:code quality|style|optimization)/i.test(specSection),
    "Spec reviewer should explicitly state NOT to evaluate code quality"
  );
});

test("reviewer-prompts.md: quality reviewer states spec already verified", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  const qualitySection = content.split("## Code Quality Reviewer")[1];
  assert(
    qualitySection,
    "Code Quality Reviewer section must exist after the heading"
  );
  assert(
    /spec.*already.*verified|do not.*re-check.*spec/i.test(qualitySection),
    "Quality reviewer should state spec compliance is already verified"
  );
});

test("reviewer-prompts.md: quality reviewer checks readability", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  const qualitySection = content.split("## Code Quality Reviewer")[1];
  assert(
    /readability|readable/i.test(qualitySection),
    "Quality reviewer should check readability"
  );
});

test("reviewer-prompts.md: quality reviewer checks error handling", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  const qualitySection = content.split("## Code Quality Reviewer")[1];
  assert(
    /error handling/i.test(qualitySection),
    "Quality reviewer should check error handling"
  );
});

test("reviewer-prompts.md: quality reviewer checks test quality", () => {
  const content = readSkillFile("inspect-work", "reviewer-prompts.md");
  const qualitySection = content.split("## Code Quality Reviewer")[1];
  assert(
    /test quality|test.*behavior|implementation details/i.test(qualitySection),
    "Quality reviewer should check test quality (behavior vs implementation details)"
  );
});

// ---------------------------------------------------------------------------
// inspect-work/re-review-protocol.md
// ---------------------------------------------------------------------------

test("re-review-protocol.md: file exists", () => {
  const filePath = path.join(SKILLS_DIR, "inspect-work", "re-review-protocol.md");
  assert(fs.existsSync(filePath), `Missing: ${filePath}`);
});

test("re-review-protocol.md: has severity levels (Critical, Important, Suggestion)", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(/Critical/i.test(content), "Missing Critical severity");
  assert(/Important/i.test(content), "Missing Important severity");
  assert(/Suggestion/i.test(content), "Missing Suggestion severity");
});

test("re-review-protocol.md: critical issues must be fixed", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(
    /critical.*must fix|critical.*no exceptions/i.test(content),
    "Should require critical issues to be fixed before proceeding"
  );
});

test("re-review-protocol.md: has re-review scoping (only fixed items)", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(
    /re-review.*only.*fixed|only.*fixed items/i.test(content),
    "Should scope re-reviews to only the fixed items"
  );
});

test("re-review-protocol.md: has maximum loop limit", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(
    /maximum.*3.*loop|3.*loop.*limit|3.*review loop/i.test(content),
    "Should have a maximum of 3 review loops"
  );
});

test("re-review-protocol.md: escalation on loop limit exceeded", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(
    /escalat|human input/i.test(content),
    "Should escalate when loop limit is exceeded"
  );
});

test("re-review-protocol.md: spec compliance before code quality sequencing", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(
    /spec.*compliance.*must.*pass.*before.*code quality|spec.*before.*quality/i.test(content),
    "Should require spec compliance to pass before code quality review"
  );
});

test("re-review-protocol.md: has termination section", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(
    /## Termination/i.test(content),
    "Should have a Termination section"
  );
});

test("re-review-protocol.md: has stage sequencing section", () => {
  const content = readSkillFile("inspect-work", "re-review-protocol.md");
  assert(
    /## Stage Sequencing/i.test(content),
    "Should have a Stage Sequencing section"
  );
});

// ---------------------------------------------------------------------------
// inspect-work/SKILL.md — M4 enhancements
// ---------------------------------------------------------------------------

test("inspect-work SKILL.md: description mentions re-review loops", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  assert(
    /re-review loop/i.test(content),
    "Description should mention re-review loops"
  );
});

test("inspect-work SKILL.md: process flow has implementer fixes loop", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  assert(
    /Implementer fixes/i.test(content),
    "Process flow should include 'Implementer fixes' node"
  );
});

test("inspect-work SKILL.md: process flow has loop exceeded diamond", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  assert(
    /3 loops exceeded/i.test(content),
    "Process flow should include '3 loops exceeded?' diamond"
  );
});

test("inspect-work SKILL.md: process flow has escalation to drive-execution", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  assert(
    /Escalate to drive-execution/i.test(content),
    "Process flow should escalate to drive-execution after 3 loops"
  );
});

test("inspect-work SKILL.md: has Re-Review Loop section", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  assert(
    /## Re-Review Loop/.test(content),
    "Should have a '## Re-Review Loop' section"
  );
});

test("inspect-work SKILL.md: re-review loop section has severity levels", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  const reReviewSection = content.split("## Re-Review Loop")[1];
  assert(reReviewSection, "Re-Review Loop section must exist");
  assert(
    /Critical.*Important.*Suggestion/i.test(reReviewSection),
    "Re-Review Loop should list severity levels"
  );
});

test("inspect-work SKILL.md: re-review loop references reviewer-prompts.md", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  const reReviewSection = content.split("## Re-Review Loop")[1];
  assert(
    /reviewer-prompts\.md/.test(reReviewSection),
    "Re-Review Loop should reference reviewer-prompts.md"
  );
});

test("inspect-work SKILL.md: re-review loop references re-review-protocol.md", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  const reReviewSection = content.split("## Re-Review Loop")[1];
  assert(
    /re-review-protocol\.md/.test(reReviewSection),
    "Re-Review Loop should reference re-review-protocol.md"
  );
});

test("inspect-work SKILL.md: re-review loop appears after Three-Stage Review", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  const threeStageIdx = content.indexOf("## Three-Stage Review");
  const reReviewIdx = content.indexOf("## Re-Review Loop");
  const issueSeverityIdx = content.indexOf("## Issue Severity");
  assert(threeStageIdx > -1, "Three-Stage Review section must exist");
  assert(reReviewIdx > -1, "Re-Review Loop section must exist");
  assert(
    reReviewIdx > threeStageIdx && reReviewIdx < issueSeverityIdx,
    "Re-Review Loop must appear after Three-Stage Review and before Issue Severity"
  );
});

test("inspect-work SKILL.md: re-review loop has max 3 loops and escalation", () => {
  const content = readSkillFile("inspect-work", "SKILL.md");
  const reReviewSection = content.split("## Re-Review Loop")[1].split("##")[0];
  assert(
    /Maximum 3 loops/i.test(reReviewSection),
    "Should mention maximum 3 loops"
  );
  assert(
    /escalate to drive-execution/i.test(reReviewSection),
    "Should mention escalation to drive-execution"
  );
});

// ---------------------------------------------------------------------------
// chart-tasks/SKILL.md — M5 enhancements
// ---------------------------------------------------------------------------

test("chart-tasks SKILL.md: HARD-GATE has no-placeholders requirement", () => {
  const content = readSkillFile("chart-tasks", "SKILL.md");
  const hardGateSection = content.split("<HARD-GATE>")[1].split("</HARD-GATE>")[0];
  assert(
    /No placeholders/i.test(hardGateSection),
    "HARD-GATE should include 'No placeholders' requirement"
  );
});

test("chart-tasks SKILL.md: HARD-GATE references placeholder-rules.md", () => {
  const content = readSkillFile("chart-tasks", "SKILL.md");
  const hardGateSection = content.split("<HARD-GATE>")[1].split("</HARD-GATE>")[0];
  assert(
    /placeholder-rules\.md/.test(hardGateSection),
    "HARD-GATE should reference placeholder-rules.md"
  );
});

test("chart-tasks SKILL.md: step 5 says 2-5 minutes atomic action", () => {
  const content = readSkillFile("chart-tasks", "SKILL.md");
  assert(
    /2-5 minutes.*atomic action|single atomic action/i.test(content),
    "Step 5 should say '2-5 minutes as a single atomic action'"
  );
});

test("chart-tasks SKILL.md: TDD sequence is 5 separate steps", () => {
  const content = readSkillFile("chart-tasks", "SKILL.md");
  assert(
    /Each TDD sequence is 5 separate steps/i.test(content),
    "Should state TDD sequence is 5 separate steps"
  );
});

test("chart-tasks SKILL.md: self-review has placeholder scan", () => {
  const content = readSkillFile("chart-tasks", "SKILL.md");
  assert(
    /Placeholder scan/i.test(content),
    "Self-review should include 'Placeholder scan'"
  );
});

test("chart-tasks SKILL.md: placeholder scan lists forbidden patterns", () => {
  const content = readSkillFile("chart-tasks", "SKILL.md");
  assert(
    /TBD.*TODO.*similar to.*see the spec.*add appropriate/i.test(content) ||
    (/TBD/.test(content) && /TODO/.test(content) && /similar to/i.test(content) && /see the spec/i.test(content) && /add appropriate/i.test(content)),
    "Placeholder scan should list TBD, TODO, 'similar to', 'see the spec', 'add appropriate'"
  );
});

// ---------------------------------------------------------------------------
// drive-execution/SKILL.md — M6 enhancements
// ---------------------------------------------------------------------------

test("drive-execution SKILL.md: has Implementer Status Handling section", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  assert(
    /## Implementer Status Handling/.test(content),
    "Should have '## Implementer Status Handling' section"
  );
});

test("drive-execution SKILL.md: status table has DONE status", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  const statusSection = content.split("## Implementer Status Handling")[1];
  assert(statusSection, "Implementer Status Handling section must exist");
  assert(
    /\*\*DONE\*\*/.test(statusSection),
    "Status table should include DONE status"
  );
});

test("drive-execution SKILL.md: status table has DONE_WITH_CONCERNS", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  const statusSection = content.split("## Implementer Status Handling")[1];
  assert(
    /DONE_WITH_CONCERNS/.test(statusSection),
    "Status table should include DONE_WITH_CONCERNS"
  );
});

test("drive-execution SKILL.md: status table has NEEDS_CONTEXT", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  const statusSection = content.split("## Implementer Status Handling")[1];
  assert(
    /NEEDS_CONTEXT/.test(statusSection),
    "Status table should include NEEDS_CONTEXT"
  );
});

test("drive-execution SKILL.md: status table has BLOCKED", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  const statusSection = content.split("## Implementer Status Handling")[1];
  assert(
    /BLOCKED/.test(statusSection),
    "Status table should include BLOCKED"
  );
});

test("drive-execution SKILL.md: status handling appears after Checklist", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  const checklistIdx = content.indexOf("## Checklist");
  const statusIdx = content.indexOf("## Implementer Status Handling");
  const templateIdx = content.indexOf("## Subagent Context Template");
  assert(checklistIdx > -1, "Checklist section must exist");
  assert(statusIdx > -1, "Implementer Status Handling section must exist");
  assert(
    statusIdx > checklistIdx && statusIdx < templateIdx,
    "Implementer Status Handling must appear after Checklist and before Subagent Context Template"
  );
});

test("drive-execution SKILL.md: parallel agents get complete context", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  assert(
    /complete context|do not assume shared knowledge/i.test(content),
    "Parallel section should mention complete context for each agent"
  );
});

test("drive-execution SKILL.md: cross-task consistency check after parallel", () => {
  const content = readSkillFile("drive-execution", "SKILL.md");
  assert(
    /cross-task consistency check/i.test(content),
    "Should mention cross-task consistency check after parallel tasks"
  );
});

// ---------------------------------------------------------------------------
// discover-intent/SKILL.md — M7 enhancements
// ---------------------------------------------------------------------------

test("discover-intent SKILL.md: visual companion bullet in checklist", () => {
  const content = readSkillFile("discover-intent", "SKILL.md");
  assert(
    /visual companion/i.test(content),
    "Checklist should offer visual companion for visual/spatial work"
  );
});

test("discover-intent SKILL.md: visual companion appears after step 1 in checklist", () => {
  const content = readSkillFile("discover-intent", "SKILL.md");
  const checklistSection = content.split("## Checklist")[1];
  assert(checklistSection, "Checklist section must exist");
  const step1Idx = checklistSection.indexOf("**Read project context**");
  const visualIdx = checklistSection.indexOf("visual companion");
  const step2Idx = checklistSection.indexOf("**Assess scope**");
  assert(step1Idx > -1, "Step 1 must exist in checklist");
  assert(visualIdx > -1, "Visual companion bullet must exist in checklist");
  assert(step2Idx > -1, "Step 2 must exist in checklist");
  assert(
    visualIdx > step1Idx && visualIdx < step2Idx,
    "Visual companion must appear between step 1 and step 2 in checklist"
  );
});

test("discover-intent SKILL.md: text-only discovery anti-pattern", () => {
  const content = readSkillFile("discover-intent", "SKILL.md");
  assert(
    /Text-only discovery for visual work/i.test(content),
    "Anti-Patterns should include 'Text-only discovery for visual work'"
  );
});

test("discover-intent SKILL.md: text-only anti-pattern mentions diagrams or mockups", () => {
  const content = readSkillFile("discover-intent", "SKILL.md");
  const antiPatternsSection = content.split("## Anti-Patterns")[1];
  assert(antiPatternsSection, "Anti-Patterns section must exist");
  assert(
    /diagram|mockup/i.test(antiPatternsSection),
    "Text-only anti-pattern should mention diagrams or mockups"
  );
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const passed = results.filter((r) => r.passed);
const failed = results.filter((r) => !r.passed);

console.log("\n--- Forge Skill Content Tests ---\n");

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
