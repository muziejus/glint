import TransformManager from '../common/transform-manager';
import { GlintConfig } from '@glint/config';
import { buildDiagnosticFormatter } from './diagnostics';

export function performBuild(
  ts: typeof import('typescript'),
  glintConfig: GlintConfig,
  tsconfigPath: string | undefined,
  optionsToExtend: import('typescript').CompilerOptions
): void {
  let host = ts.createSolutionBuilderHost();
  ts.createSolutionBuilder(host, rootNames, optionsToExtend);
}
