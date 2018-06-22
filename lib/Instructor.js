"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
class Instructor {
    constructor(store) {
        this.store = store;
    }
    set(path, value, index) {
        this.store.update([Instructor.createSet(path, value, index)][Symbol.iterator]());
    }
    add(path, value, index) {
        this.store.update([Instructor.createAdd(path, value, index)][Symbol.iterator]());
    }
    remove(path, index) {
        this.store.update([Instructor.createRemove(path, index)][Symbol.iterator]());
    }
    static createSet(path, value, index) {
        return { path, value, type: InstructionType_1.InstructionType.set, index };
    }
    static createAdd(path, value, index) {
        return { path, index, value, type: InstructionType_1.InstructionType.add };
    }
    static createRemove(path, index) {
        return { path, index, type: InstructionType_1.InstructionType.remove };
    }
}
exports.Instructor = Instructor;
//# sourceMappingURL=Instructor.js.map