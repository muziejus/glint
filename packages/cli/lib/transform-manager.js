"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transform_1 = require("@glint/transform");
class TransformManager {
    constructor(ts, glintConfig) {
        this.ts = ts;
        this.glintConfig = glintConfig;
        this.transformedModules = new Map();
        this.formatDiagnosticHost = {
            getCanonicalFileName: (name) => name,
            getCurrentDirectory: this.ts.sys.getCurrentDirectory,
            getNewLine: () => this.ts.sys.newLine,
        };
    }
    getTransformDiagnostics(sourceFile) {
        if (sourceFile) {
            let transformedModule = this.transformedModules.get(sourceFile.fileName);
            return transformedModule ? this.buildDiagnostics(transformedModule) : [];
        }
        return [...this.transformedModules.values()].flatMap((transformedModule) => {
            return this.buildDiagnostics(transformedModule);
        });
    }
    formatDiagnostic(diagnostic) {
        let file = diagnostic.file;
        let transformedModule = file && this.transformedModules.get(file.fileName);
        if (diagnostic.code && file && transformedModule) {
            let sourceFile = this.ts.createSourceFile(file.fileName, transformedModule.originalSource, file.languageVersion);
            diagnostic = transform_1.rewriteDiagnostic(diagnostic, transformedModule, sourceFile);
        }
        return this.ts.formatDiagnosticsWithColorAndContext([diagnostic], this.formatDiagnosticHost);
    }
    readFile(filename, encoding) {
        let source = this.ts.sys.readFile(filename, encoding);
        let config = this.glintConfig;
        if (source &&
            filename.endsWith('.ts') &&
            !filename.endsWith('.d.ts') &&
            config.includesFile(filename) &&
            config.environment.moduleMayHaveTagImports(source)) {
            let transformedModule = transform_1.rewriteModule(filename, source, config.environment);
            if (transformedModule) {
                this.transformedModules.set(filename, transformedModule);
                return transformedModule.transformedSource;
            }
        }
        return source;
    }
    buildDiagnostics(transformedModule) {
        if (!transformedModule.errors.length) {
            return [];
        }
        let sourceFile = this.ts.createSourceFile(transformedModule.filename, transformedModule.originalSource, this.ts.ScriptTarget.ESNext);
        return transformedModule.errors.map((error) => ({
            category: this.ts.DiagnosticCategory.Error,
            code: 0,
            file: sourceFile,
            start: error.location.start,
            length: error.location.end - error.location.start,
            messageText: `[glint] ${error.message}`,
        }));
    }
}
exports.default = TransformManager;
