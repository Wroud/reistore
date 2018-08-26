"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Transformer_1 = require("./Transformer");
const InstructionType_1 = require("./enums/InstructionType");
class Schema {
    constructor(transformator) {
        this.transformator = transformator;
        this.scopes = [];
        this.applyChange = this.applyChange.bind(this);
        this.transform = this.transform.bind(this);
    }
    get schema() {
        return this;
    }
    transform(store, change) {
        if (this.transformator !== undefined) {
            const transformer = new Transformer_1.Transformer(store, this.applyChange);
            this.transformator(change, transformer);
        }
        else {
            this.applyChange(store, change);
        }
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
    applyChange(store, change) {
        if (this.scopes.length === 0) {
            const { type, node: node, value } = change;
            switch (type) {
                case InstructionType_1.InstructionType.set:
                case InstructionType_1.InstructionType.add:
                case InstructionType_1.InstructionType.remove:
                    if (node) {
                        store.addChange(node.set(store.state, value));
                    }
                    break;
            }
            return;
        }
        for (const scope of this.scopes) {
            scope.transform(store, change);
        }
    }
}
exports.Schema = Schema;
function createSchema(transformator) {
    return new Schema(transformator);
}
exports.createSchema = createSchema;
//# sourceMappingURL=Schema.js.map