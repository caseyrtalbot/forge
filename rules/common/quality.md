# Forge Quality Standards

## Test-First Development

Write the test before writing the code. Run the test and confirm it fails for the expected reason. Write the minimal implementation. Confirm the test passes. This applies to all new functionality and bug fixes. Exceptions: configuration files, type definitions, static assets.

## Evidence Over Assertions

Never claim work is complete without showing the output that proves it. "The tests pass" requires the test output. "The build succeeds" requires the build output. Run the command, capture the result, present the result.

## Code Review

Every implemented task gets reviewed before being marked complete. Reviews cover three dimensions:
1. Spec compliance (does it match what was planned?)
2. Code quality (is it readable, well-structured, and maintainable?)
3. Security (is it safe from common vulnerabilities?)

Categorize findings by severity: Critical (must fix), Important (should fix), Suggestion (note for future).

## Commit Discipline

Commit after each working task, not after all tasks. Each commit should represent one coherent change that passes its verification criteria. Use conventional commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`.
