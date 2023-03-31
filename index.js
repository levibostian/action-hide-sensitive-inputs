const core = require('@actions/core');

// Get a list of inputs that we should hide the values of. 

const listOfInputsToExclude = core.getInput('exclude_inputs').split(',').map(item => item.trim());
let inputsObject = require(process.env.GITHUB_EVENT_PATH).inputs;
let allInputKeys = Object.keys(inputsObject);

core.info(`All inputs for this workflow: ${allInputKeys}`)
core.info(`List of inputs to exclude: ${listOfInputsToExclude}`)

const inputKeysToHide = allInputKeys.filter(inputKey => !listOfInputsToExclude.includes(inputKey))

core.info(`After removing the inputs to exclude, these are all of the inputs that will be hidden: ${inputKeysToHide}`)

// Time to hide the values 

for (const inputKey of inputKeysToHide) {    
  core.setSecret(inputsObject[inputKey])
}

core.info('Done! You can now feel free to use ${{ input.X }} as you normally would and have value hidden in GitHub Action run logs.')