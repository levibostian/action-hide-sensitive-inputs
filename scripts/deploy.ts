
import $ from "jsr:@david/dax@0.45.0"
import * as decaf_sdk from "jsr:@levibostian/decaf-sdk@0.7.0"

const input = decaf_sdk.getDeployStepInput()

await $`npm ci`.printCommand()
await $`npm run compile`.printCommand()
await $`git add -f dist && git commit -m "chore: release {{ versionName }}"`.printCommand()

if (input.testMode) {
  await $`git push --dry-run origin latest`.printCommand()  
} else {
  await $`git push origin latest`.printCommand()
}

const COMMIT_SHA = await $`git rev-parse HEAD`.text()
await $`deno run --allow-all --quiet jsr:@levibostian/decaf-script-major-tag --commit-sha ${COMMIT_SHA}`.printCommand()
await $`deno run --allow-all --quiet jsr:@levibostian/decaf-script-github-releases set --generate-notes --latest --target ${COMMIT_SHA}`.printCommand()