# Rationalization Table

When tempted to skip the test, find your excuse below. The reality column is why you write the test anyway.

| Excuse | Reality | What To Do Instead |
|--------|---------|-------------------|
| "Too simple to test" | Simple code breaks. Simple tests take 30 seconds. | Write the 30-second test. Discipline is the point. |
| "I'll write tests after" | Tests-after verify what code does, not what it should do. They encode bugs as expected behavior. | Delete the code. Write the test first. Implement from the test. |
| "Tests after achieve the same goals" | Tests-after answer "what does this do?" Tests-first answer "what should this do?" You get coverage but lose proof the tests work. | Accept that order matters. Write the test, watch it fail, then implement. |
| "I already manually tested it" | Ad-hoc is not systematic. No record, can't re-run, easy to forget cases under pressure. | Write automated tests that run the same way every time. |
| "Deleting X hours of work is wasteful" | Sunk cost fallacy. The time is gone. Keeping unverified code is the real waste: technical debt with no proof of correctness. | Delete it. Rewrite with TDD. The result is code you can trust. |
| "I'll keep it as reference and write tests first" | You will adapt it. "Reference" becomes "implementation with tests bolted on." That is testing after. | Delete means delete. Do not look at it while writing the test. |
| "I need to explore first" | Exploration is fine. But exploration is not implementation. The spike is throwaway by definition. | Spike, learn, throw the spike away. Start implementation with a test. |
| "The test is too hard to write" | If you cannot describe expected behavior, you do not understand the requirement. The test difficulty is a signal. | Go back to the task description. Clarify the requirement. Then write the test. |
| "TDD will slow me down" | TDD is faster than debugging. Every "shortcut" that skips the test costs more time downstream. | Accept the upfront cost. It pays back within the same task. |
| "Time pressure / deadline" | Bugs from untested code cost more time than the test would have taken. Pressure makes discipline more important, not less. | Write the test. A 2-minute test saves a 2-hour debug session. |
| "This is just a spike / prototype" | Spikes without tests become production code. Every "temporary" solution that works gets kept. | Label it a spike. Throw it away. Start the real implementation with a test. |
| "I'm just refactoring" | Refactoring without tests is rewriting blind. You have no proof behavior is preserved. | Write characterization tests for existing behavior first. Then refactor. |
| "Existing code has no tests" | You are improving it now. The lack of tests is the problem you are fixing, not permission to continue without them. | Add tests for the code you are changing. Leave the codebase better. |
| "Manual testing is faster" | Manual does not prove edge cases. You will re-test every change by hand. It does not scale. | Write the automated test once. It runs forever. |
| "This is different because..." | It is not different. This rationalization is the most dangerous because it sounds reasonable. Every exception erodes the discipline. | Apply the same rule. No exceptions without explicit human approval. |
