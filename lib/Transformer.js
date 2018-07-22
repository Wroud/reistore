"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Instructor_1 = require("./Instructor");
class Transformer {
    constructor(scope, state) {
        this.scopeSelector = scope;
        this.state = state;
    }
    get scope() {
        return this.scopeSelector();
    }
    set(path, value, ...pathArgs) {
        return Instructor_1.Instructor.createSet(path, value, pathArgs);
    }
    add(path, value, ...pathArgs) {
        return Instructor_1.Instructor.createAdd(path, value, pathArgs);
    }
    remove(path, index, ...pathArgs) {
        return Instructor_1.Instructor.createRemove(path, index, pathArgs);
    }
}
exports.Transformer = Transformer;
//# sourceMappingURL=Transformer.js.map