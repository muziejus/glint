import type ts from 'typescript';
import { GlintConfig } from '@glint/config';
export default class TransformManager {
    private ts;
    private glintConfig;
    private transformedModules;
    constructor(ts: typeof import('typescript'), glintConfig: GlintConfig);
    getTransformDiagnostics(sourceFile?: ts.SourceFile): Array<ts.Diagnostic>;
    formatDiagnostic(diagnostic: ts.Diagnostic): string;
    readFile(filename: string, encoding?: string): string | undefined;
    private readonly formatDiagnosticHost;
    private buildDiagnostics;
}
