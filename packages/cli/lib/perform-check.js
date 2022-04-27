"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performCheck = void 0;
const transform_manager_1 = __importDefault(require("./transform-manager"));
function performCheck(ts, rootNames, glintConfig, configPath, optionsToExtend) {
    let transformManager = new transform_manager_1.default(ts, glintConfig);
    let parsedConfig = loadTsconfig(ts, configPath, optionsToExtend);
    let compilerHost = createCompilerHost(ts, parsedConfig.options, transformManager);
    let program = ts.createProgram({
        rootNames: rootNames.length ? rootNames : parsedConfig.fileNames,
        options: parsedConfig.options,
        host: compilerHost,
    });
    program.emit();
    let diagnostics = collectDiagnostics(program, transformManager);
    for (let diagnostic of diagnostics) {
        console.error(transformManager.formatDiagnostic(diagnostic));
    }
    process.exit(diagnostics.length ? 1 : 0);
}
exports.performCheck = performCheck;
function collectDiagnostics(program, transformManager) {
    return [
        ...program.getSyntacticDiagnostics(),
        ...transformManager.getTransformDiagnostics(),
        ...program.getSemanticDiagnostics(),
        ...program.getDeclarationDiagnostics(),
    ];
}
function createCompilerHost(ts, options, transformManager) {
    let host = ts.createCompilerHost(options);
    host.readFile = function (filename) {
        return transformManager.readFile(filename);
    };
    return host;
}
function loadTsconfig(ts, configPath, optionsToExtend) {
    if (!configPath) {
        return {
            fileNames: [],
            options: optionsToExtend,
            errors: [],
        };
    }
    let config = ts.getParsedCommandLineOfConfigFile(configPath, optionsToExtend, {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic(diagnostic) {
            let { messageText } = diagnostic;
            if (typeof messageText !== 'string') {
                messageText = messageText.messageText;
            }
            throw new Error(messageText);
        },
    });
    if (!config) {
        throw new Error('Unknown error loading config');
    }
    return config;
}
