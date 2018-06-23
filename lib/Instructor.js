"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
class Instructor {
    constructor(store) {
        this.store = store;
    }
    set(path, value, pathArgs, index) {
        this.store.update([Instructor.createSet(path, value, pathArgs, index)][Symbol.iterator]());
    }
    add(path, value, pathArgs, index) {
        this.store.update([Instructor.createAdd(path, value, pathArgs, index)][Symbol.iterator]());
    }
    remove(path, pathArgs, index) {
        this.store.update([Instructor.createRemove(path, pathArgs, index)][Symbol.iterator]());
    }
    static createSet(path, value, pathArgs = [], index) {
        return { path, args: pathArgs, index, value, type: InstructionType_1.InstructionType.set };
    }
    static createAdd(path, value, pathArgs = [], index) {
        return { path, args: pathArgs, index, value, type: InstructionType_1.InstructionType.add };
    }
    static createRemove(path, pathArgs, index) {
        return { path, args: pathArgs, index, type: InstructionType_1.InstructionType.remove };
    }
}
exports.Instructor = Instructor;
//# sourceMappingURL=Instructor.js.map