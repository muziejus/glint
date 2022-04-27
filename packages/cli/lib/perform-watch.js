"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performWatch = void 0;
const transform_manager_1 = __importDefault(require("./transform-manager"));
function performWatch(ts, glintConfig, tsconfigPath, optionsToExtend) {
    let transformManager = new transform_manager_1.default(ts, glintConfig);
    let host = ts.createWatchCompilerHost(tsconfigPath !== null && tsconfigPath !== void 0 ? tsconfigPath : 'tsconfig.json', optionsToExtend, sysForWatchCompilerHost(ts, transformManager), ts.createSemanticDiagnosticsBuilderProgram, (diagnostic) => console.error(transformManager.formatDiagnostic(diagnostic)));
    patchWatchCompilerHost(host, transformManager);
    ts.createWatchProgram(host);
}
exports.performWatch = performWatch;
function sysForWatchCompilerHost(ts, transformManager) {
    return {
        ...ts.sys,
        readFile(path, encoding) {
            return transformManager.readFile(path, encoding);
        },
    };
}
function patchWatchCompilerHost(host, transformManager) {
    let { afterProgramCreate } = host;
    host.afterProgramCreate = (program) => {
        patchProgram(program, transformManager);
        afterProgramCreate === null || afterProgramCreate === void 0 ? void 0 : afterProgramCreate.call(host, program);
    };
}
function patchProgram(program, transformManager) {
    let { getSyntacticDiagnostics } = program;
    program.getSyntacticDiagnostics = function (sourceFile, cancelationToken) {
        let diagnostics = getSyntacticDiagnostics.call(program, sourceFile, cancelationToken);
        let transformDiagnostics = transformManager.getTransformDiagnostics(sourceFile);
        return [...diagnostics, ...transformDiagnostics];
    };
}
