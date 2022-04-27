import type ts from 'typescript';
import TransformManager from '../common/transform-manager';
import { GlintConfig } from '@glint/config';
import { buildDiagnosticFormatter } from './diagnostics';
import { loadTsconfig } from './utils/for-build';

type TypeScript = typeof ts;

export function performBuild(
  ts: typeof import('typescript'),
  glintConfig: GlintConfig,
  tsconfigPath: string | undefined,
  optionsToExtend: ts.BuildOptions
): void {
  let transformManager = new TransformManager(ts, glintConfig);
  let parsedConfig = loadTsconfig(ts, transformManager, tsconfigPath, optionsToExtend);
  let rootNames = parsedConfig.fileNames;

  let host = createCompilerHost(ts, transformManager);
  let builder = ts.createSolutionBuilder(host, rootNames, optionsToExtend);
  builder.build();

  // TODO: get diagnostics!
  let baselineDiagnostics = collectDiagnostics(builder, transformManager, parsedConfig.options);
  // let fullDiagnostics = transformManager.rewriteDiagnostics(baselineDiagnostics);
  // for (let diagnostic of fullDiagnostics) {
  //   console.error(formatDiagnostic(diagnostic));
  // }

  // process.exit(fullDiagnostics.length ? 1 : 0);
}

type BuilderHost = ts.SolutionBuilderHost<ts.EmitAndSemanticDiagnosticsBuilderProgram>;
type Builder = ts.SolutionBuilder<ts.EmitAndSemanticDiagnosticsBuilderProgram>;

function createCompilerHost(ts: TypeScript, transformManager: TransformManager): BuilderHost {
  let formatDiagnostic = buildDiagnosticFormatter(ts);

  let host = ts.createSolutionBuilderHost(
    sysForBuildCompilerHost(ts, transformManager),
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    (diagnostic) => formatDiagnostic(diagnostic)
  );
  host.fileExists = transformManager.fileExists;
  host.readFile = transformManager.readTransformedFile;
  host.readDirectory = transformManager.readDirectory;
  return host;
}

function sysForBuildCompilerHost(
  ts: TypeScript,
  transformManager: TransformManager
): typeof ts.sys {
  return {
    ...ts.sys,
    readDirectory: transformManager.readDirectory,
    watchDirectory: transformManager.watchDirectory,
    fileExists: transformManager.fileExists,
    watchFile: transformManager.watchTransformedFile,
    readFile: transformManager.readTransformedFile,
  };
}

function collectDiagnostics(
  builder: Builder,
  transformManager: TransformManager,
  options: ts.CompilerOptions
): Array<ts.Diagnostic> {
  return [
    ...builder.getSyntacticDiagnostics(),
    ...transformManager.getTransformDiagnostics(),
    ...builder.getSemanticDiagnostics(),
    ...(options.declaration ? builder.getDeclarationDiagnostics() : []),
  ];
}
