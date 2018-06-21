"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("./tools");
const Transformer_1 = require("./Transformer");
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
        instructions = tools_1.exchangeIterator(instructions, instruction => {
            const transformer = new Transformer_1.Transformer(instruction);
            this.transformator(instruction, this.isInstruction(instruction), transformer, this.getState(state));
            return transformer.toIterator();
        });
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
//# sourceMappingURL=StoreSchema.js.map