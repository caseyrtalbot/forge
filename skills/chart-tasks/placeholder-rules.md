# Placeholder Rules and Step Granularity

Reference material for chart-tasks. Plans that violate these rules fail the self-review.

## Forbidden Placeholders

These patterns are plan failures. If found during self-review, fix them immediately:

| Pattern | Why it fails | Fix |
|---------|-------------|-----|
| "TBD" / "TODO" / "implement later" | Defers decisions to the implementer who has no context | Make the decision now, write the code |
| "Add appropriate error handling" | Vague. What errors? What handling? | Show the actual try/catch or error check code |
| "Write tests for the above" | Which tests? What assertions? | Write the actual test code with specific assertions |
| "Similar to Task N" | Implementer may read tasks out of order or in isolation | Repeat the full code, even if it looks redundant |
| "See the spec for details" | The plan IS the spec for the implementer | Inline the relevant details from the spec |
| References to undefined types/functions | Creates compile errors or confusion | Define or import everything referenced |
| "Handle edge cases" | Which edges? What cases? | List each edge case and show the handling code |
| "Add validation" | Validate what? Against what rules? | Show the validation code with specific rules |

## Atomic Step Standard

Each step is ONE action that takes 2-5 minutes:

**TDD sequence = 5 separate steps:**
1. Write the failing test (one step)
2. Run the test, confirm it fails for the right reason (one step)
3. Write the minimal implementation (one step)
4. Run the test, confirm it passes (one step)
5. Commit (one step)

**Invalid compound steps:**
- "Write the test and implementation" (two actions)
- "Run tests and commit" (two actions)
- "Create the file with all methods" (multiple actions if methods are complex)

**Every code step includes:**
- The actual code to write (in a code block)
- The exact file path
- The exact command to run (if it is a verification step)
- The expected output (pass/fail, specific error message)
