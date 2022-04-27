"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTypeScript = void 0;
const resolve_1 = __importDefault(require("resolve"));
function loadTypeScript() {
    var _a;
    let ts = (_a = tryResolve(() => require(resolve_1.default.sync('typescript', { basedir: process.cwd() })))) !== null && _a !== void 0 ? _a : tryResolve(() => require('typescript'));
    if (!ts) {
        throw new Error('[glint] Unable to load TypeScript');
    }
    return ts;
}
exports.loadTypeScript = loadTypeScript;
function tryResolve(load) {
    try {
        return load();
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 'MODULE_NOT_FOUND') {
            return null;
        }
        throw error;
    }
}
