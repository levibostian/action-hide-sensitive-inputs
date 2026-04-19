import $ from "jsr:@david/dax@0.45.0"
import * as decaf_sdk from "jsr:@levibostian/decaf-sdk@0.7.0"

// I created this script only because I need to use 'input.testMode'. Otherwise I could have inlined this into the github action yaml file. 

const input = decaf_sdk.getDeployStepInput()

// merge in the latest code. 
await $`git checkout latest`.printCommand()
await $`git merge --ff main`.printCommand()

// build and commit the dist files.
await $`npm ci`.printCommand()
await $`npm run compile`.printCommand()
await $`git add -f dist && git commit -m "chore: release {{ versionName }}"`.printCommand()

// push the dist files to the 'latest' branch.
if (input.testMode) {
  console.log("Running in test mode, skipping command: git push")
} else {
  await $`git push`.printCommand()
}

// push to deploy 
const COMMIT_SHA = await $`git rev-parse HEAD`.text()
await $`deno run --allow-all --quiet jsr:@levibostian/decaf-script-major-tag --commit-sha ${COMMIT_SHA} --tag-prefix v`.printCommand()
await $`deno run --allow-all --quiet jsr:@levibostian/decaf-script-github-releases-release-branch set --release-branch latest`.printCommand()