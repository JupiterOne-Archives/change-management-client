# JupiterOne Change Management Client

JupiterOne can help you automate the enforcement of code review and security
policies regarding pull request approval, author and reviewer validation, and
vulnerability checks. For more information, please read the
[JupiterOne documentation](https://support.jupiterone.io/hc/en-us/articles/360022721934-Detect-Suspicious-Code-Commits).

## Usage

This package uses the
[JupiterOne Node.js client](https://github.com/JupiterOne/jupiterone-client-nodejs)
to gather information about specified pull requests from JupiterOne and returns
a yes or no verdict with an explanatory comment to be used in a CICD pipeline.

To see a full GitHub CICD pipeline using this client with Travis CI, check out
[JupiterOne/change-management-example](https://github.com/JupiterOne/change-management-example).
