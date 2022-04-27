"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineOptionsToExtend = void 0;
function determineOptionsToExtend(argv) {
    let options = {};
    if ('declaration' in argv) {
        options.noEmit = !argv.declaration;
        options.declaration = argv.declaration;
        options.emitDeclarationOnly = argv.declaration;
    }
    else {
        options.noEmit = true;
    }
    return options;
}
exports.determineOptionsToExtend = determineOptionsToExtend;
