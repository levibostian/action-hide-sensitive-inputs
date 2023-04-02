# action-hide-sensitive-inputs

Are you sending sensitive data to a GitHub Action workflow as a `workflow_dispatch` input? This Action prevents leaking those values to the logs of your GitHub Action. 

Example: Let's say that one of your Workflow inputs is `email_address` and you want to keep the email address private from the Action logs when running the Workflow. By default, all inputs are visible to the public and therefore, the email address `dana@green.com`, would be visible to the public. However, if you instruct GitHub Actions to keep that email address value private, you will see `***` printed in the Action logs instead of `dana@green.com`. 

> Note: This Action, when it works as intended, can make text in GitHub Action logs hidden from the public. However, this Action is not meant to replace GitHub Action's best practices (such as using [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)) to truly keep sensitive data private. This Action was designed to hide inputs, such as an email address, that would be nice to be kept private, but are not critical to be kept private. It's recommended you follow the same practice. 

# Getting started 

Here is an example GitHub Action workflow that uses `workflow_dispatch` and some input data. 

```yaml
name: Sign up user for Beta

on: 
  workflow_dispatch:
    inputs:
      #######################
      # This input is sensitive and should be kept private. 
      # We don't want the value of it shown in the logs when we run this workflow!
      #######################
      user_email_address: 
        description: "Email address to register for the app's beta"
        required: true 

jobs:
  register-for-beta:
    runs-on: ubuntu-latest
    steps:
    # Run this GitHub Action before any other steps in your workflow. 
    - name: Hide the inputs values to keep them private in the logs when running this workflow
      uses: levibostian/action-hide-sensitive-inputs@v1

    # Safely use ${{ inputs.user_email_address }} in your workflow without worrying that an 
    # email address getting shown in the logs when running this workflow. 
    - run: ./register-for-beta --email "${{ inputs.user_email_address }}"
```

# Options

| Key              | Description                                                                                        | Required? |
|------------------|----------------------------------------------------------------------------------------------------|-----------|
| `exclude_inputs` | Comma-separated list of input keys to not hide the value of. Example: `phone-number,email-address` | No        |

# Contributing

Want to contribute to this project and make it better? Thanks for your interest! Here is how to setup your development environment for this project. 

* `npm install`
* All source code for the Action lives in `index.js` file. 
* All testing of the plugin is done by GitHub Actions running the Action. Make commits and push those commits to GitHub. After you push, the GitHub Action `.github/workflows/test.yml` will automatically execute and run the Action `.github/workflows/run-action-via-dispatch.yml`. Manually view the logs from executing this workflow to see if the Action behaves correctly. 

# How does this Action work? 

This section of the docs is optional and meant for educational purposes. If you are looking to just use the Action, you can skip this section. 

### How do you hide sensitive inputs in GitHub Action logs?

GitHub Actions provides a feature to hide strings - [`add-mask`](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#masking-a-value-in-log). This feature works, but you have to be careful when you use `add-mask` because it's easy to use incorrectly. It's not as easy as: `echo "::add-mask::${{ inputs.user_email_address }}"` because GitHub Actions seems to perform it's steps like this: 

1. Replace expressions with the values. In this example, replace `${{ inputs.user_email_address }}` with the value `dana@green.com`. 
2. Add to the Action logs the command about to execute. In this example, add this to the logs: `echo "::add-mask::dana@green.com`
3. Apply `add-mask` command to the value `dana@green.com`. This means the next time that the string `dana@green.com` is attempted to be logged, GitHub Actions will instead log `***`. 

As you can see in step 2 above, the input value gets leaked to the Action logs. GitHub Actions logs the command about to be executed, *then* actually applies `add-mask`. 

`add-mask` works, but you need to be thoughtful when using it. While browsing for ideas online on how to hide `workflow_dispatch` input values, I found [this clever use of `add-mask`](https://github.com/actions/runner/issues/643#issuecomment-823537871) which involves JSON parsing. Because `${{ inputs.user_email_address }}` is never used in the `echo` command, the value of `input.user_email_address` is kept secret. Clever hack! 

From that hack, this workflow worked well for me: 

```yaml
on: 
  workflow_dispatch:
    inputs:
      user_email_address: 
        description: "Email address to register for the app's beta"
        required: true 

jobs:
  register-for-beta:
    runs-on: ubuntu-latest
    steps:
    - name: Create secret environment variables from inputs 
      run: |
        EMAIL_ADDRESS=$(jq -r '.inputs.user_email_address' $GITHUB_EVENT_PATH)
        echo ::add-mask::$EMAIL_ADDRESS
        echo EMAIL_ADDRESS="$EMAIL_ADDRESS" >> $GITHUB_ENV
    - name: Now, I can safely use input via environment variable
      run: echo "$EMAIL_ADDRESS" # the output from this command will be "echo ***"
```

This solution works, but it is boilerplate heavy and is suspectable to human error. Making the email address value not as safe as it could be. 

This gave me an idea. Create a node script that...
1. Gets all `workflow_dispatch` input values from the environment variable `$GITHUB_EVENT_PATH`. This way, you don't have to send any data to the node script and potentially leak the value. 
2. Since the node script controls what information gets printed to the console, this node script could use `add-mask` in the script but be sure not to send any of that code to the output of the node script. 
3. Allow the ability to exclude inputs from having their values hidden, but by default, make *all* inputs hidden. This avoids forgetting to hide an input. 

The result? One line of code to feel confident that input values will be kept private. 🎉🎉🎉

```yaml
- uses: levibostian/action-hide-sensitive-inputs@v1
```



