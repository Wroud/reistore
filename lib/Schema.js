"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("./tools");
const Transformer_1 = require("./Transformer");
class Schema {
    constructor(initState, transformator) {
        this.initState = initState || {};
        this.transformator = transformator;
        this.scopes = [];
    }
    transform(state, instructions) {
        if (this.transformator !== undefined) {
            const transformer = new Transformer_1.Transformer(() => this.getState(state), state);
            instructions = tools_1.exchangeIterator(instructions, instruction => this.transformator(instruction, transformer));
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