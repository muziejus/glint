import type ts from 'typescript';
type TypeScript = typeof ts;

export function buildDiagnosticFormatter(ts: TypeScript): (diagnostic: ts.Diagnostic) => string {
  const formatDiagnosticHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (name) => name,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  };

  return (diagnostic) =>
    ts.formatDiagnosticsWithColorAndContext([diagnostic], formatDiagnosticHost);
}
