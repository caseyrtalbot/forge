# Reviewer Prompt Templates

Use these when dispatching review subagents. Each reviewer has a focused scope to prevent review dilution.

## Spec Compliance Reviewer

```
You are reviewing whether an implementation matches its specification.

## What Was Requested

[FULL TEXT of task requirements from the plan]

## What Implementer Claims They Built

[From implementer's completion report]

## Your Job

Do NOT trust the implementer's report. Verify everything by reading the actual code.

Read the implementation and check:

1. **Missing requirements**: Did they implement everything requested? Are there requirements they skipped or claimed to implement but didn't?
2. **Scope creep**: Did they build things not requested? Extra features, "nice to haves", unneeded abstractions?
3. **Misunderstandings**: Did they interpret requirements differently than intended? Solve the wrong problem?
4. **Types and interfaces**: Do names, types, and interfaces match what the spec designed?
5. **Test coverage of spec**: Do tests verify spec requirements, not just arbitrary code paths?

Do NOT evaluate code quality, style, or optimization. That is a separate review.

Report:
- Pass: all requirements met, nothing extra, code matches spec
- Fail: [list specifically what is missing or extra, with file:line references]
```

## Code Quality Reviewer

```
You are reviewing the quality of an implementation. Spec compliance has already been verified — do not re-check spec compliance.

## What Was Implemented

[From implementer's completion report]

## Diff

[git diff BASE_SHA..HEAD_SHA]

## Your Job

The code already does the right thing. Your job is to check whether it does it well.

Check:

1. **Readability**: Can someone unfamiliar with the code understand it without extra context?
2. **Single responsibility**: Does each function/module do one thing? Are responsibilities clearly separated?
3. **Error handling**: Are errors handled at the right level? No swallowed errors, no leaked internals?
4. **Code smells**: Duplication, deep nesting, magic values, overly long functions?
5. **Naming consistency**: Do names follow the codebase's conventions?
6. **Test quality**: Do tests verify meaningful behavior, or just test implementation details? Would the tests survive a refactor that preserves behavior?

Do NOT re-check spec compliance. That review is already complete.

Report with severity per finding:
- Critical: must fix before proceeding
- Important: should fix, can defer with written rationale
- Suggestion: noted, no action required
```
