import core from '@actions/core';
import fs from 'fs';
import colors from 'ansi-styles';

// Get a list of inputs that we should hide the values of. 

const listOfInputsToExclude = core.getInput('exclude_inputs').split(',').map(item => item.trim());
let inputsObject = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).inputs;
let allInputKeys = Object.keys(inputsObject);

core.info(`${colors.blue.open}All inputs for this workflow: ${allInputKeys}`)
core.info(`${colors.blue.open}List of inputs to exclude: ${listOfInputsToExclude}`)

const inputKeysToHide = allInputKeys.filter(inputKey => !listOfInputsToExclude.includes(inputKey))

core.info(`${colors.yellow.open}After removing the inputs to exclude, these are all of the inputs that will be hidden: ${inputKeysToHide}`)

// Time to hide the values 

core.info('')

for (const inputKey of inputKeysToHide) {    
  core.info(`${colors.white.open}Hiding value for input: ${inputKey}`)
  core.setSecret(inputsObject[inputKey])
}

core.info('')

// Done! 

core.info(`${colors.green.open}Done!`)