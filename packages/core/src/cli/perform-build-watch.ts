import TransformManager from '../common/transform-manager';
import { GlintConfig } from '@glint/config';
import { buildDiagnosticFormatter } from './diagnostics';
import type ts from 'typescript';
import { sysForWatchCompilerHost } from './watch-utils';

type TypeScript = typeof ts;

export function performBuildWatch(
  ts: TypeScript,
  glintConfig: GlintConfig,
  tsconfigPath: string | undefined,
  optionsToExtend: ts.CompilerOptions,
  rootNames: string[]
): void {
  let transformManager = new TransformManager(ts, glintConfig);
  let formatDiagnostic = buildDiagnosticFormatter(ts);
  let sys = sysForWatchCompilerHost(ts, transformManager);
  let host = ts.createSolutionBuilderWithWatchHost(
    sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    (diagnostic) => console.error(formatDiagnostic(diagnostic))
  );

  patchBuildWatchCompilerHost(host, transformManager);
}

type Program = ts.EmitAndSemanticDiagnosticsBuilderProgram;
type WatchHost = ts.SolutionBuilderWithWatchHost<Program>;

function patchBuildWatchCompilerHost(host: WatchHost, transformManager: TransformManager): void {
  let { afterProgramEmitAndDiagnostics } = host;
  host.afterProgramEmitAndDiagnostics = (program) => {
    patchProgram(program, transformManager);
    afterProgramEmitAndDiagnostics?.call(host, program);
  };
}

function patchProgram(program: Program, transformManager: TransformManager): void {
  let { getSyntacticDiagnostics, getSemanticDiagnostics } = program;

  program.getSyntacticDiagnostics = (sourceFile, cancellationToken) => {
    let diagnostics = getSyntacticDiagnostics.call(program, sourceFile, cancellationToken);
    let transformDiagnostics = transformManager.getTransformDiagnostics(sourceFile?.fileName);
    return [...diagnostics, ...transformDiagnostics];
  };

  program.getSemanticDiagnostics = (sourceFile, cancellationToken) => {
    let diagnostics = getSemanticDiagnostics.call(program, sourceFile, cancellationToken);
    return transformManager.rewriteDiagnostics(diagnostics);
  };

  // TODO: how should *emit* work?
}
