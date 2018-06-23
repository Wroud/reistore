"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
class Instructor {
    constructor(store) {
        this.store = store;
    }
    beginTransaction() {
        this.transaction = [];
        this.isTransaction = true;
    }
    flush() {
        this.store.update(this.transaction[Symbol.iterator]());
        this.isTransaction = false;
    }
    undoTransaction() {
        this.transaction = [];
        this.isTransaction = false;
    }
    set(path, value, pathArgs, index) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createSet(path, value, pathArgs, index));
        }
        else {
            this.store.update([Instructor.createSet(path, value, pathArgs, index)][Symbol.iterator]());
        }
    }
    add(path, value, pathArgs, index) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createAdd(path, value, pathArgs, index));
        }
        else {
            this.store.update([Instructor.createAdd(path, value, pathArgs, index)][Symbol.iterator]());
        }
    }
    remove(path, pathArgs, index) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createRemove(path, pathArgs, index));
        }
        else {
            this.store.update([Instructor.createRemove(path, pathArgs, index)][Symbol.iterator]());
        }
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