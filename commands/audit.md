---
name: audit
description: "Run comprehensive quality, security, and completeness audit on current work."
---
Run a comprehensive quality, security, and completeness audit on the current work.

## Usage
`/forge:audit`

## Process
1. Deploy quality-auditor agent to review all changed files against the plan
2. Deploy security-sentinel agent to scan for vulnerabilities
3. Deploy integration-verifier agent to run full test suite
4. Compile results into a single audit report with PASS/FAIL per category
5. Write report to `.forge/evidence/audit-report.md`
