# Forge Safety Guardrails

## Destructive Operations

Before running destructive commands (rm -rf, DROP TABLE, git push --force, git reset --hard), pause and consider whether a safer alternative exists. Prefer reversible operations. When destructive operations are necessary, confirm with the user first.

## Secrets

Never hardcode API keys, passwords, tokens, or credentials in source code. Use environment variables. If you encounter hardcoded secrets in existing code, flag them immediately.

## Input Validation

Validate all user input at system boundaries (API endpoints, form submissions, CLI arguments). Use parameterized queries for database operations. Escape output appropriately for the context (HTML, SQL, shell).

## Error Handling

Handle errors at the appropriate level. Do not swallow errors silently. Do not expose internal details (stack traces, file paths, SQL queries) in user-facing error messages. Log errors with enough context to diagnose the problem.

## Scope Discipline

Only modify files that the current task requires. Do not make "while I'm here" changes to unrelated code. Do not add features not in the spec. Do not refactor code that is not part of the current plan.
