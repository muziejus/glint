"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const config_1 = require("@glint/config");
const perform_watch_1 = require("./perform-watch");
const perform_check_1 = require("./perform-check");
const options_1 = require("./options");
const load_typescript_1 = require("./load-typescript");
const { argv } = yargs_1.default
    .scriptName('glint')
    .usage('$0 [options] [file...]')
    .option('project', {
    alias: 'p',
    string: true,
    description: 'The path to the tsconfig file to use',
})
    .option('watch', {
    alias: 'w',
    boolean: true,
    description: 'Whether to perform an ongoing watched build',
})
    .option('declaration', {
    alias: 'd',
    boolean: true,
    description: 'Whether to emit declaration files',
})
    .wrap(100)
    .strict();
const ts = load_typescript_1.loadTypeScript();
const glintConfig = config_1.loadConfig(process.cwd());
const tsconfigPath = (_a = argv.project) !== null && _a !== void 0 ? _a : ts.findConfigFile('.', ts.sys.fileExists);
const optionsToExtend = options_1.determineOptionsToExtend(argv);
if (argv.watch) {
    perform_watch_1.performWatch(ts, glintConfig, tsconfigPath, optionsToExtend);
}
else {
    perform_check_1.performCheck(ts, argv._, glintConfig, tsconfigPath, optionsToExtend);
}
