"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("./Store");
class Scope extends Store_1.Store {
    constructor(parent, path, transformator) {
        super(undefined, transformator);
        ;
        this.parent = parent;
        this.store = isScope(parent) ? parent.store : parent;
        this.path = path;
        this.parent.addScope(this);
    }
    get state() {
        return this.path.get(this.store.state, {});
    }
    createScope(scope, transformator) {
        return new Scope(this, this.path.join(scope), transformator);
    }
    update(instructions) {
        this.store.update(instructions);
    }
}
exports.Scope = Scope;
function isScope(object) {
    return "path" in object;
}
exports.isScope = isScope;
//# sourceMappingURL=Scope.js.map