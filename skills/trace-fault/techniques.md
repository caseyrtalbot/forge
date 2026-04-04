# Investigation Techniques

Reference material for trace-fault. These techniques supplement the core investigation protocol.

## 1. Defense-in-Depth

After fixing a root cause, add validation at TWO layers:
- The layer where bad data entered the system (entry point)
- The layer where the bug manifested (consumption point)

Single-point fixes are fragile. The same invalid data pattern will recur through a different code path -- a new caller, a refactored module, a mock that skips the original guard. Two validation points catch the variant you did not anticipate.

```typescript
// Entry point: API boundary rejects early
function createProject(name: string, dir: string) {
  if (!dir || !existsSync(dir)) {
    throw new Error(`Invalid project directory: ${dir}`);
  }
  // ...
}

// Consumption point: query builder refuses to proceed
function initWorkspace(projectDir: string) {
  if (!projectDir) {
    throw new Error('projectDir required for workspace init');
  }
  // ...
}
```

If either layer is bypassed (mock, new caller, refactor), the other still catches it.

## 2. Condition-Based Waiting

Never use `sleep(N)` or arbitrary retry counts to wait for async operations.

Poll for the actual condition (file exists, port responds, state changes) with a timeout that produces a clear error when the condition is never met. Arbitrary delays guess at timing -- they pass on fast machines and fail under load or in CI.

```typescript
// Bad: guessing how long the server needs
await sleep(2000);
fetch('http://localhost:3000');

// Good: polling for the real condition
await waitFor(
  () => portResponds(3000),
  'server to start on port 3000',
  10000 // timeout with clear error
);
fetch('http://localhost:3000');
```

The `waitFor` pattern: poll every 10-50ms, throw with a descriptive message on timeout. The description tells you what the system was waiting for, not just that it timed out.

Exception: when testing actual timing behavior (debounce intervals, rate limits), a documented arbitrary delay is correct. Comment WHY.

## 3. Parallel Investigation

When 3+ independent failures exist across different subsystems, dispatch one investigation agent per failure domain.

**When to use:** failures are in separate subsystems with no shared state. Fixing one cannot fix or break another. Each can be understood without context from the others.

**Each agent gets:**
- One specific failure (test name, error output, stack trace)
- The relevant source files for that subsystem only
- Expected behavior and success criteria
- Constraint: do not modify code outside your subsystem

**Integration:** when agents return, review each summary, check for conflicting edits, run the full test suite to verify fixes compose correctly.

**When NOT to use:**
- Failures are related (fix one, others may resolve -- investigate together first)
- Shared state between subsystems (agents would interfere with each other)
- You do not yet understand what is broken (exploratory debugging needs full context)

## 4. Architecture Questioning

After 3 failed fix attempts on the same bug, STOP fixing.

The bug may be an architectural problem masquerading as a local defect. Symptoms: each fix reveals new coupling in a different place, fixes require "massive refactoring," each fix creates new failures elsewhere.

**Questions to ask:**
- Is the abstraction wrong? (forcing callers to work around it)
- Is the data model creating the mismatch? (workarounds at every boundary)
- Is the coupling too tight? (fix here, break there)
- Is this a symptom of a missing layer? (validation, translation, or coordination that does not exist)

**What to do:** stop attempting a 4th fix. Describe the architectural concern -- what pattern you see across the 3 failures -- and present it to the user. This is not a failed investigation. This is the investigation revealing that the fix is not local.
