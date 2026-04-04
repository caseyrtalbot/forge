# The Iron Law: Extended Guidance

## Verification Checklist

Before marking any implementation task complete, confirm all eight:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason (feature missing, not typo or syntax error)
- [ ] Wrote minimal code to pass each test (no extras, no "while I'm here")
- [ ] All tests pass (new and existing)
- [ ] Test output is pristine (no errors, no warnings, no skipped tests)
- [ ] Tests use real code (mocks only when external dependencies make them unavoidable)
- [ ] Edge cases and error paths are covered

Cannot check all eight boxes? You skipped TDD. Start over.

## Delete and Start Over

Code written before its test has no proof of correctness. The response is not to retroactively add tests. The response is to delete the code and begin with the test.

Why delete instead of adapt:
- "Reference" code biases the test. You test what you built, not what the requirement demands.
- Adapting existing code with tests bolted on produces tests-after, not tests-first. The proof guarantee is lost.
- The sunk cost is already spent. Keeping unverified code trades short-term comfort for long-term debt.

Delete means delete. Do not keep it in a comment. Do not stash it. Do not look at it while writing the test. Implement fresh from the test.

## Letter vs Spirit

Ways to technically follow TDD while violating its purpose:

- **Writing a test that cannot fail.** `expect(true).toBe(true)` is not a test. The test must assert behavior that does not yet exist.
- **Writing the implementation, then writing a test that matches it.** The test encodes what you built, not what you need. Order matters.
- **Writing a test so broad it passes with any implementation.** The test must be specific enough to constrain the solution.
- **Mocking everything.** If the test only exercises mocks, it proves mock behavior, not code behavior. Mocks are a last resort for external boundaries.
- **Testing private internals.** Tests describe public behavior. Coupling tests to internals makes refactoring impossible without rewriting tests.
- **Marking a test as skipped and moving on.** A skipped test is a missing test. Fix it or delete it.

Violating the letter of the rules is violating the spirit of the rules. If you find yourself looking for a technicality, you are rationalizing.

## Red Flags

Stop and reassess when you notice any of these:

- **Test passes on first run.** You are testing existing behavior, not new behavior. Fix the test.
- **Cannot explain why the test fails.** You do not understand the requirement well enough. Go back to the task description.
- **Test was added after implementation.** That is tests-after. Delete the implementation. Start with the test.
- **Rationalizing "just this once."** It is never just this once. The excuse is in the [rationalization table](rationalization-table.md).
- **Test requires massive setup.** The design is too coupled. Simplify the interface before writing more test scaffolding.
- **All assertions use mocks.** You are testing the test framework, not your code. Use real objects.
- **"This is different because..."** It is not different. Apply the rule.

All of these mean the same thing: stop, delete code written out of order, start over with a failing test.
