# Playwright (TS binding) + Cucumber (BDD)

Cucumber is a popular behavior-driven development (BDD) tool that allows developers and stakeholders to collaborate on defining and testing application requirements in a human-readable format. 
TypeScript is a powerful superset of JavaScript that adds optional static typing, making it easier to catch errors before runtime. By combining these two tools, we can create more reliable and maintainable tests.

## Features

1. Awesome report with screenshots, videos & logs
2. Execute tests on multiple environments 
3. Parallel execution
4. Rerun only failed features
5. Retry failed tests on CI
6. Github Actions integrated with downloadable report
7. Page object model
8. Open Playwright trace files directly from the hosted report
9. Multiple tab support - see `PageManager` class.

## Sample report
![image](https://github.com/ortoniKC/Playwright_Cucumber_TS/assets/58769833/da2d9f5a-85e7-4695-8ce2-3378b692afc4)


## Project structure

- .github -> yml file to execute the tests in GitHub Actions
- src -> Contains all the features & Typescript code
- test-results -> Contains all the reports related file

## Reports

1. [Mutilple Cucumber Report](https://github.com/WasiqB/multiple-cucumber-html-reporter)
2. Default Cucumber report
3. [Logs](https://www.npmjs.com/package/winston)
4. Screenshots of failure
5. Test videos of failure
6. Trace of failure

## Get Started

### Setup:

1. Clone or download the project
2. Extract and open in the VS-Code
3. `npm i` to install the dependencies
4. `npx playwright install` to install the browsers
5. `npm run test` to execute the tests
6. To run a particular test change  
```
  paths: [
            "src/test/features/featurename.feature"
         ] 
```
7. Use tags to run a specific or collection of specs: `npm run test --tags="@test or @add"`
8. Run on a specific browser: `npm run test --browser="firefox"`
9. To debug tests, use the `npm run debug` command. This will run tests in debug mode.
10. After running tests, you can view a report using the `npm run open:report`
11. If tests fail, you can rerun them using `npm run test:failed`
12. To run only the tests tagged with `@only`, use the `npm run test:only`
13. To run all tests except those tagged with `@ignore`, use the `npm run test:ignore`


### Folder structure
0. `src\pages` -> All the page (UI screen)
1. `src\test\features` -> write your features here
2. `src\test\steps` -> Your step definitions goes here
3. `src\hooks\hooks.ts` -> Browser setup and teardown logic
4. `src\hooks\pageFixture.ts` -> Simple way to share the page objects to steps
5. `src\helper\env` -> Multiple environments are handled
6. `src\helper\types` -> To get environment code suggestions
7. `src\helper\report` -> To generate the report
8. `config/cucumber.js` -> One file to do all the magic
9. `package.json` -> Contains all the dependencies
10. `src\helper\auth` -> Storage state (Auth file)
11. `src\helper\util` -> Read test data from json & logger

## Tutorials
1. Learn Playwright - [Playwright - TS](https://youtube.com/playlist?list=PL699Xf-_ilW7EyC6lMuU4jelKemmS6KgD)
2. BDD in detail - [TS binding](https://youtube.com/playlist?list=PL699Xf-_ilW6KgK-S1l9ynOnBGiZl2Bsk)

## Test Statuses and Reporting
Initially, the code was set to capture screenshots, videos, and trace files only for scenarios with 
`result.status === 'PASSED'`. 
However, to provide more comprehensive reporting capabilities, the code has been updated to handle various Cucumber statuses and capture the appropriate test artifacts accordingly.

### Cucumber Statuses
Cucumber provides several statuses that indicate the outcome of a scenario or step during test execution. Here's a brief overview of each status:

1. __PASSED__:
  - __*Meaning*__: The scenario or step has executed successfully without any failures.
  - __*Test Execution*__: The test runs to completion.
2. __FAILED__:
  - __*Meaning*__: The scenario or step has encountered a failure during execution. This could be due to an assertion failure, exception, or an explicit failure step.
  - __*Test Execution*__: The test runs but encounters a failure.
3. __PENDING__:
  - __*Meaning*__: The scenario or step has a pending implementation. It indicates that the step definition for the corresponding step is missing or not yet implemented.
  - __*Test Execution*__: The test does not run for the pending steps.
4. __SKIPPED__:
  - __*Meaning*__: The scenario or step has been skipped explicitly using tags or annotations. It is intentionally not executed.
  __*Test Execution*__: The test does not run for the skipped scenarios or steps.
5. __UNDEFINED__:
  - __*Meaning*__: The scenario or step does not have a corresponding step definition. It indicates that the step implementation is missing.
  - __*Test Execution*__: The test does not run for the undefined steps.
6. __AMBIGUOUS__:
  - __*Meaning*__: There are multiple step definitions that match a given step in a scenario. Cucumber cannot determine which step definition to execute.
  - __*Test Execution*__: The test execution is halted when an ambiguous step is encountered.
7. __UNKNOWN__:
  - __*Meaning*__: This status is used when Cucumber encounters an unknown or unexpected situation during test execution.
  - __*Test Execution*__: The behavior may vary depending on the specific circumstances that led to the UNKNOWN status.

### Policy for capturing screenshots, videos, trace files
Based on the Cucumber statuses, the following policy has been implemented for capturing screenshots, videos, and trace files:

- __PASSED__ and __FAILED__: Capture screenshots, videos, and trace files.
- __UNKNOWN__: Capture screenshots, videos, and trace files to aid in investigating the unexpected situation.
- __PENDING__ or __SKIPPED__: Skip capturing screenshots, videos, and trace files.
- __UNDEFINED__ or __AMBIGUOUS__: Skip capturing screenshots and videos, but capture trace files for debugging purposes.

Feel free to modify this behaviour in `hooks.ts` / `ArtifactManager.ts` as per your project needs

### Disabling Screenshots, Video, Logging, and Tracing

You can disable screenshots, video recording, logging, and tracing on a per-test basis using the following tags:

- `@disable:screenshot`: Disables screenshot capturing for the tagged test.
- `@disable:video`: Disables video recording for the tagged test.
- `@disable:log`: Disables logging for the tagged test.
- `@disable:trace`: Disables tracing for the tagged test.

To use these tags, simply add them to your feature / scenario in your `.feature` file.
