"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StoreSchema_1 = require("./StoreSchema");
class Scope extends StoreSchema_1.StoreSchema {
    constructor(parent, path, transformator) {
        super(transformator);
        this.parent = parent;
        this.store = isScope(parent) ? parent.store : parent;
        this.path = path.toMutable();
        this.parent.addScope(this);
    }
    getState(state) {
        return this.path.get(state, {});
    }
    createScope(scope, transformator) {
        return new Scope(this, this.path.join(scope), transformator);
    }
}
exports.Scope = Scope;
function createScope(parent, path, transformator) {
    return new Scope(parent, path, transformator);
}
exports.createScope = createScope;
function isScope(object) {
    return "path" in object;
}
exports.isScope = isScope;
//# sourceMappingURL=Scope.js.map