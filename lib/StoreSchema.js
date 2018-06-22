"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("./tools");
class StoreSchema {
    constructor(transformator) {
        this.isInstruction = (instruction) => (path, strict) => {
            return instruction.path.includes(path, strict);
        };
        this.transformator = transformator;
        this.scopes = [];
    }
    getState(state) {
        return state;
    }
    transform(state, instructions) {
        if (this.transformator === undefined) {
            for (const scope of this.scopes) {
                instructions = scope.transform(state, instructions);
            }
            return instructions;
        }
        instructions = tools_1.exchangeIterator(instructions, instruction => this.transformator(instruction, this.isInstruction(instruction), this.getState(state), state));
        for (const scope of this.scopes) {
            instructions = scope.transform(state, instructions);
        }
        return instructions;
    }
    addScope(scope) {
        this.scopes.push(scope);
    }
    removeScope(scope) {
        const id = this.scopes.indexOf(scope);
        if (id > -1) {
            this.scopes.splice(id, 1);
        }
    }
}
exports.StoreSchema = StoreSchema;
function createSchema(transformator) {
    return new StoreSchema(transformator);
}
exports.createSchema = createSchema;
//# sourceMappingURL=StoreSchema.js.map