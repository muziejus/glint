import type ts from 'typescript';
import { GlintConfig } from '@glint/config';
export declare function performCheck(ts: typeof import('typescript'), rootNames: string[], glintConfig: GlintConfig, configPath: string | undefined, optionsToExtend: ts.CompilerOptions): void;
