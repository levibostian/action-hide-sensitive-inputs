const core = require('@actions/core');

const listOfInputsToExclude = core.getInput('exclude_inputs').split(',').map(item => item.trim());
let allInputsForWorkflow = Object.keys(require(process.env.GITHUB_EVENT_PATH).inputs);

core.info(`List of inputs to exclude: ${listOfInputsToExclude}`)
core.info(`All inputs for this workflow: ${allInputsForWorkflow}`)

allInputsForWorkflow = allInputsForWorkflow.filter(inputKey => !listOfInputsToExclude.includes(inputKey))

core.info(`After removing the inputs to exclude, these are all of the inputs that will be hidden: ${allInputsForWorkflow}`)

