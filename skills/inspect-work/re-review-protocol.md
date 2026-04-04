# Re-Review Protocol

When a review stage finds issues, this protocol ensures they get fixed, not just noted.

## The Loop

1. Reviewer reports issues with severity: **Critical**, **Important**, or **Suggestion**.
2. **Critical issues**: implementer MUST fix before proceeding. No exceptions.
3. **Important issues**: implementer SHOULD fix. Can proceed only with written rationale for deferring.
4. **Suggestions**: noted. No action required.
5. After fixes: reviewer re-reviews ONLY the fixed items (not a full re-review of everything).
6. Loop repeats until no Critical issues remain AND all Important issues are fixed or explicitly acknowledged.

## Termination

- Maximum 3 review loops per stage.
- If still failing after 3 loops, escalate to drive-execution for human input.
- The 3-loop limit prevents infinite fix/review cycles on subjective issues.

## Stage Sequencing

- Spec compliance MUST pass before code quality review begins.
- Rationale: no point reviewing code quality if the code implements the wrong thing.
- Security review runs last, after both spec compliance and code quality pass.
