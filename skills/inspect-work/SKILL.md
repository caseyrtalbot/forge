---
name: inspect-work
description: "Use after task completion to review code against the plan. Multi-dimensional review covering spec compliance, code quality, and security. Phase: VERIFICATION."
phase: verification
transitions:
  - target: drive-execution
    condition: "Review passes, return to orchestrator for next task"
  - target: prove-first
    condition: "Review fails, implementer must fix issues"
gates:
  entry: "A task has been implemented and tests pass"
  exit: "Review passes on all dimensions (spec compliance, code quality, security)"
---

# Inspect Work

Review completed task implementation across three dimensions: does it match the spec, is the code well-written, and is it secure? This is a structured review, not a rubber stamp.

<HARD-GATE>
Review is not optional and cannot be skipped for "simple" tasks. Every implemented task gets reviewed before being marked complete. The review must cover all three dimensions. Passing on code quality does not excuse a spec compliance failure.
</HARD-GATE>

## Process Flow

```dot
digraph inspect_work {
    "Read task spec + diff" [shape=box];
    "Stage 1: Spec compliance" [shape=box];
    "Spec passes?" [shape=diamond];
    "Stage 2: Code quality" [shape=box];
    "Quality passes?" [shape=diamond];
    "Stage 3: Security scan" [shape=box];
    "Security passes?" [shape=diamond];
    "Report: all clear" [shape=doublecircle];
    "Report: issues found" [shape=box];

    "Read task spec + diff" -> "Stage 1: Spec compliance";
    "Stage 1: Spec compliance" -> "Spec passes?";
    "Spec passes?" -> "Stage 2: Code quality" [label="yes"];
    "Spec passes?" -> "Report: issues found" [label="no"];
    "Stage 2: Code quality" -> "Quality passes?";
    "Quality passes?" -> "Stage 3: Security scan" [label="yes"];
    "Quality passes?" -> "Report: issues found" [label="no"];
    "Stage 3: Security scan" -> "Security passes?";
    "Security passes?" -> "Report: all clear" [label="yes"];
    "Security passes?" -> "Report: issues found" [label="no"];
}
```

## Three-Stage Review

### Stage 1: Spec Compliance
- Does the implementation match what was planned?
- Are all requirements from the task description addressed?
- Are there additions not in the spec (scope creep)?
- Do types, method names, and interfaces match what was designed?

### Stage 2: Code Quality
- Is the code readable and well-structured?
- Are functions focused (single responsibility)?
- Is error handling present and appropriate?
- Are there code smells (duplication, deep nesting, magic values)?
- Do tests actually test meaningful behavior (not just coverage)?

### Stage 3: Security
- Is user input validated and sanitized?
- Are SQL queries parameterized?
- Are secrets kept out of code?
- Are authentication/authorization checks present where needed?
- Are error messages safe (no internal details leaked)?

## Issue Severity

Categorize every finding:

| Severity | Definition | Action |
|----------|-----------|--------|
| **Critical** | Breaks functionality, security vulnerability, data loss risk | Must fix before proceeding |
| **Important** | Code smell, missing edge case, suboptimal pattern | Should fix, can proceed if acknowledged |
| **Suggestion** | Style preference, minor optimization, documentation gap | Note for future, proceed |

## Anti-Patterns

**"Looks good to me"**
A review with no findings is suspicious. Every piece of code has something worth noting, even if it is a suggestion. If you found nothing, you did not look hard enough.

**"I'll just review the final result at the end"**
Review per task, not per project. Issues compound. A wrong abstraction in task 2 infects tasks 3 through 8.

**"The tests pass so the code is correct"**
Tests verify behavior, not quality. Passing tests with SQL injection vulnerabilities still pass tests.

## Evidence Requirements

- Review report exists with findings categorized by severity
- All critical issues are resolved before the task is marked complete
- The review explicitly covers all three stages

## Transition

If all stages pass (no critical issues): return to **drive-execution** to proceed with the next task.
If critical issues found: return to **prove-first** for the implementer to fix.
