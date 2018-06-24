"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("./tools");
class Schema {
    constructor(initState, transformator) {
        this.isInstruction = (instruction) => (path, args, strict) => {
            if (args !== undefined
                && (instruction.args === undefined
                    || args.length > instruction.args.length)) {
                return false;
            }
            const isPathEqual = instruction.path.includes(path, strict);
            if (!isPathEqual
                || args === undefined
                || instruction.args === undefined
                || args.length === 0) {
                return isPathEqual;
            }
            for (let i = 0; i < args.length; i++) {
                if (args[i] !== instruction.args[i]) {
                    return false;
                }
            }
            return true;
        };
        this.initState = initState || {};
        this.transformator = transformator;
        this.scopes = [];
    }
    transform(state, instructions) {
        if (this.transformator !== undefined) {
            instructions = tools_1.exchangeIterator(instructions, instruction => this.transformator(instruction, this.isInstruction(instruction), this.getState(state), state));
        }
        for (const scope of this.scopes) {
            instructions = scope.transform(state, instructions);
        }
        return instructions;
    }
    bindSchema(schema) {
        this.scopes.push(schema);
    }
    unBindSchema(schema) {
        const id = this.scopes.indexOf(schema);
        if (id > -1) {
            this.scopes.splice(id, 1);
        }
    }
}
exports.Schema = Schema;
//# sourceMappingURL=Schema.js.map