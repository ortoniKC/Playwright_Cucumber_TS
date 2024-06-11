import { ITestCaseHookParameter } from "@cucumber/cucumber";

export default class ScenarioManager {

    constructor(private cucumberScenario: ITestCaseHookParameter) { }

    get DashedName() {
        return this.formatScenarioName();
    }

    get Title() {
        return this.cucumberScenario.pickle.name;
    }

    get Status() {
        return this.cucumberScenario.result?.status;
    }

    hasTag(tagName: string) {
        const { pickle } = this.cucumberScenario;
        return pickle.tags.some((tag) => tag.name === tagName);
    }

    private formatScenarioName() {
        const { pickle } = this.cucumberScenario;
        const pickleName = pickle.name.split(' ').join('-'); // Replace spaces with dashes
        return `${pickleName}_${pickle.id}`;
    }
}