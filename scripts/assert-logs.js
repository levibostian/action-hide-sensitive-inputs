#!/usr/bin/env node
// Downloads all logs from a GitHub Actions workflow run and asserts on their contents.
//
// Required environment variables:
//   RUN_URL   - The API URL of the workflow run (e.g. https://api.github.com/repos/owner/repo/actions/runs/123)
//   GH_TOKEN  - GitHub token with actions:read permission (used by gh cli)

import { execSync } from "child_process"
import { mkdtempSync, readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const runUrl = process.env.RUN_URL

if (!runUrl) {
  console.error("RUN_URL environment variable is required")
  process.exit(1)
}

// Download the logs zip via gh cli and extract it.
const tmpDir = mkdtempSync(join(tmpdir(), "gh-logs-"))
const zipPath = join(tmpDir, "logs.zip")
const extractDir = join(tmpDir, "extracted")

console.log(`Downloading logs from: ${runUrl}/logs`)
execSync(`gh api "${runUrl}/logs" > "${zipPath}"`, { shell: true })
execSync(`unzip -q "${zipPath}" -d "${extractDir}"`)
console.log(`Extracted logs to: ${extractDir}`)

// Recursively collect all .txt file contents.
function collectTextFiles(dir) {
  let contents = ""
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      contents += collectTextFiles(fullPath)
    } else if (entry.endsWith(".txt")) {
      contents += readFileSync(fullPath, "utf8")
    }
  }
  return contents
}

const allLogs = collectTextFiles(extractDir)
console.log(`Collected ${allLogs.length} characters of log content`)

// Run assertions.
let passed = 0
let failed = 0

function assertNotContains(text, forbidden) {
  if (text.includes(forbidden)) {
    console.error(`FAIL: logs must NOT contain '${forbidden}' but they do`)
    failed++
  } else {
    console.log(`PASS: logs do not contain '${forbidden}'`)
    passed++
  }
}

function assertContains(text, expected) {
  if (text.includes(expected)) {
    console.log(`PASS: logs contain '${expected}'`)
    passed++
  } else {
    console.error(`FAIL: logs must contain '${expected}' but they don't`)
    failed++
  }
}

assertNotContains(allLogs, "super-secret-api-key-here")
assertContains(allLogs, "This is public info that does not need hidden")
assertContains(allLogs, "This is more public info that does not need hidden")

console.log(`\nResults: ${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
