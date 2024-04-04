const tags = process.env.npm_config_tags || "";

const commonConfig = {
    formatOptions: {
        snippetInterface: "async-await"
    },
    paths: [
        "src/test/features/**/*"
    ],
    publishQuiet: true,
    dryRun: false,
    require: [
        "src/test/steps/**/*.ts",
        "src/hooks/hooks.ts"
    ],
    requireModule: [
        "ts-node/register"
    ],
    format: [
        "progress-bar",
        "html:test-results/cucumber-report.html",
        "json:test-results/cucumber-report.json",
        "rerun:@rerun.txt"
    ],
};

module.exports = {
    default: {
        ...commonConfig,
        tags: tags,
        parallel: 2,
    },
    debug: {
        ...commonConfig,
        tags: `${tags ? `@debug and ${tags}` : '@debug'}`,
        parallel: 1,
    },
    rerun: {
        ...commonConfig,
        paths: [],
        parallel: 2
    }
}