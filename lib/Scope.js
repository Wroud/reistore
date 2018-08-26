"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const Schema_1 = require("./Schema");
const Transformer_1 = require("./Transformer");
const Node_1 = require("./Node");
class Scope extends Schema_1.Schema {
    constructor(parent, node, transformator) {
        super(transformator);
        this.parent = parent;
        this._schema = parent.schema;
        if (Node_1.isCountainer(node)) {
            this.node = node[interfaces_1.PathNode];
        }
        else {
            this.node = node;
        }
        this.parent.bindSchema(this);
        this.transform = this.transform.bind(this);
    }
    get schema() {
        return this._schema;
    }
    transform(store, change) {
        if (this.transformator !== undefined) {
            const transformer = new Transformer_1.Transformer(store, this.applyChange, this.node);
            this.transformator(change, transformer);
        }
        else {
            this.applyChange(store, change);
        }
    }
    createScope(node, transformator) {
        return new Scope(this, node, transformator);
    }
}
exports.Scope = Scope;
function createScope(parent, node, transformator) {
    return new Scope(parent, node, transformator);
}
exports.createScope = createScope;
function isScope(object) {
    return object instanceof Scope;
}
exports.isScope = isScope;
//# sourceMappingURL=Scope.js.map