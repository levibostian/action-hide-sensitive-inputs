import core from '@actions/core';
import chalk from 'chalk';
import fs from 'fs';

// Get a list of inputs that we should hide the values of. 

const listOfInputsToExclude = core.getInput('exclude_inputs').split(',').map(item => item.trim());
let inputsObject = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).inputs;
let allInputKeys = Object.keys(inputsObject);

core.info(chalk.blue(`All inputs for this workflow: ${allInputKeys}`))
core.info(chalk.blue(`List of inputs to exclude: ${listOfInputsToExclude}`))

const inputKeysToHide = allInputKeys.filter(inputKey => !listOfInputsToExclude.includes(inputKey))

core.info(chalk.yellow(`After removing the inputs to exclude, these are all of the inputs that will be hidden: ${inputKeysToHide}`))

// Time to hide the values 

core.info('')

for (const inputKey of inputKeysToHide) {    
  core.info(`Hiding value for input: ${inputKey}`)
  core.setSecret(inputsObject[inputKey])
}

core.info('')

// Done! 

core.info(chalk.green('Done! You can now feel free to use ${{ input.X }} as you normally would and have value hidden in GitHub Action run logs.'))