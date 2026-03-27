# Forge Agent Collaboration

## Agent Dispatch

When delegating work to a subagent, provide precise context:
- The specific task or question
- Relevant file paths
- Success criteria or expected output format
- What the agent should NOT do (scope boundaries)

Do not provide the entire project history or conversation context. Construct exactly what the agent needs.

## Fresh Agents Per Task

Dispatch a fresh agent instance for each task. Do not reuse agents across tasks. Fresh agents prevent context pollution and ensure each task gets focused attention.

## Review Before Trust

Do not blindly accept agent output. Review the agent's work before acting on it. Check that the output matches the expected format, addresses the task, and does not contain hallucinated information.

## Parallel Dispatch

When tasks are independent (no shared state, no sequential dependencies), dispatch agents in parallel for faster execution. When tasks depend on each other, dispatch sequentially.

## Model Routing

Use opus for tasks requiring judgment, reasoning, and contextual understanding (code review, architecture, security analysis, implementation). Use sonnet for mechanical tasks where speed matters more than depth (file search, documentation sync, dependency mapping).
