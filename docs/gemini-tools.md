# Gemini CLI Tool Mapping

Forge skills use Claude Code tool names. When running on Gemini CLI, use these equivalents:

| Skill references | Gemini CLI equivalent |
|-----------------|----------------------|
| `Read` | `read_file` |
| `Write` | `write_file` |
| `Edit` | `replace` |
| `Bash` | `run_shell_command` |
| `Grep` | `grep_search` |
| `Glob` | `glob` |
| `Skill` (invoke a skill) | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` (dispatch subagent) | No equivalent |

## Subagent Limitation

Gemini CLI does not support subagent dispatch. Skills that rely on dispatching agents (`drive-execution`, `inspect-work`, `confirm-complete`) will need to execute inline rather than delegating to fresh agents. The workflow and evidence gates still apply.

## Available Skills

All skills in `skills/*/SKILL.md` are available. Start with `discover-intent` for new work, or `trace-fault` for debugging.
