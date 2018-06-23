"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StoreSchema_1 = require("./StoreSchema");
const tools_1 = require("./tools");
const Path_1 = require("./Path");
class Scope extends StoreSchema_1.StoreSchema {
    constructor(parent, path, transformator) {
        super(transformator);
        this.parent = parent;
        this.store = isScope(parent) ? parent.store : parent;
        this.path = path.toMutable();
        this.parent.addScope(this);
    }
    getState(state) {
        return tools_1.isStore(state)
            ? this.path.get(state.state, {})
            : this.path.get(state, {});
    }
    createScope(scope, transformator) {
        const rpath = Path_1.isPath(scope) ? scope : Path_1.Path.fromSelector(scope);
        return new Scope(this, this.path.join(rpath), transformator);
    }
}
exports.Scope = Scope;
function createScope(parent, path, transformator) {
    const rpath = Path_1.isPath(path) ? path : Path_1.Path.fromSelector(path);
    return new Scope(parent, rpath, transformator);
}
exports.createScope = createScope;
function isScope(object) {
    return "path" in object;
}
exports.isScope = isScope;
//# sourceMappingURL=Scope.js.map