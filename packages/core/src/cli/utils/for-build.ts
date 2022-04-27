import ts from 'typescript';
import TransformManager from '../../common/transform-manager';

type TypeScript = typeof ts;

export function loadTsconfig(
  ts: TypeScript,
  transformManager: TransformManager,
  configPath: string | undefined,
  optionsToExtend: ts.CompilerOptions
): ts.ParsedCommandLine {
  if (!configPath) {
    return {
      fileNames: [],
      options: optionsToExtend,
      errors: [],
    };
  }

  let config = ts.getParsedCommandLineOfConfigFile(configPath, optionsToExtend, {
    ...ts.sys,
    readDirectory: transformManager.readDirectory,
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
