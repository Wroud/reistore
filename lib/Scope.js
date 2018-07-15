"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("./tools");
const Path_1 = require("./Path");
const Schema_1 = require("./Schema");
class Scope extends Schema_1.Schema {
    constructor(parent, path, initState, transformator, mutateParent = true) {
        super(initState, transformator);
        this.parent = parent;
        this.schema = isScope(parent)
            ? parent.schema
            : parent;
        this.path = mutateParent ? path.toMutable() : path;
        this.parent.bindSchema(this);
    }
    setInitState(store) {
        store.instructor.set(this.path, v => v === undefined ? this.initState : v);
        for (const scope of this.scopes) {
            scope.setInitState(store);
        }
    }
    getState(state) {
        return tools_1.isStore(state)
            ? this.path.get(state.state, this.initState)
            : this.path.get(state, this.initState);
    }
    joinPath(path) {
        return this.path.join(path);
    }
    createScope(scope, initState, transformator, mutateParent) {
        return new Scope(this, this.path.join(scope), initState, transformator, mutateParent);
    }
}
exports.Scope = Scope;
function createScope(parent, path, initState, transformator, mutateParent) {
    const rpath = Path_1.isPath(path) ? path : Path_1.Path.create(path);
    return new Scope(parent, rpath, initState, transformator, mutateParent);
}
exports.createScope = createScope;
function isScope(object) {
    return "path" in object && "parent" in object;
}
exports.isScope = isScope;
//# sourceMappingURL=Scope.js.map