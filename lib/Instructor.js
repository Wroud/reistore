"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
class Instructor {
    constructor(store) {
        this.store = store;
    }
    set(path, value) {
        this.store.update([
            { path, value, type: InstructionType_1.InstructionType.set }
        ][Symbol.iterator]());
    }
    add(path, value, index) {
        this.store.update([
            { path, index, value, type: InstructionType_1.InstructionType.add }
        ][Symbol.iterator]());
    }
    remove(path, index) {
        this.store.update([
            { path, index, type: InstructionType_1.InstructionType.remove }
        ][Symbol.iterator]());
    }
}
exports.Instructor = Instructor;
//# sourceMappingURL=Instructor.js.map