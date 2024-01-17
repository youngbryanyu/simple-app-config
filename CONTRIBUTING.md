# Contributing

## How to make changes
1. [Fork the repo](https://help.github.com/articles/fork-a-repo/)
2. [Install pnpm](https://pnpm.io/installation)
3. Create a new local feature branch using `git checkout -b <your-feature-branch-name>`
4. Commit your changes using `git commit -m '<commit message>'`
5. Test your changes by running the test script in `package.json` using `pnpm run test`
6. Push to a new feature branch using `git push origin <your-feature-branch-name>`
7. [Create a pull request](https://help.github.com/articles/creating-a-pull-request). Your PR will need to pass all checks in the CI/CD pipeline to be able to merge.

## Testing
We are using [jest](https://jestjs.io/) to run unit tests. Run the test script using
```
pnpm run test
```

## Code style
We are using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code styling and best practices. Make sure your code adheres to the ESLint rules by running the script
```
pnpm run lint
```

If there are any errors due to violating prettier rules automatically fix them using the prettier script
```
pnpm run prettier
```

If you are using VSCode make sure to install the [EditorConfig](https://editorconfig.org/) plugin as we are also using that for maintaining consistent style.

## Pipeline
We are using GitHub Actions' Workflow pipelines for automation. The following checks must pass in order to have a valid PR that can be merged:
- Style and Lint checks
- Unit Tests
- Successful build
- Updated NPM Version Number (this will automatically pass if only markdown or workflow files were changed)

Upon pushing your code the following all above checks will run again in addition to the actions below:
- Publish new package version to NPM
- Create release and tag on GitHub

The overall pipeline workflow is:
1. Style and lint checks
2. Unit tests
3. Perform a build
4. Detect if there were code changes (only on push and pull).
5. Check if the NPM version number was updated (only on push and pull). The actual step within the workflow that performs this is only run if there were code changes detected.
6. Publish new package version to NPM (only on push). The actual step within the workflow that performs this is only run if there were code changes detected.
7. Create release and tag on GitHub (only on push). The actual step within the workflow that performs this is only run if there were code changes detected.

> :warning: Thus, markdown file changes will need to be manually published to NPM. The release and tags on GitHub will need to be manually created as well. 
