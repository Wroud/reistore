"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
class Instructor {
    constructor(store) {
        this.store = store;
    }
    getTransaction() {
        return this.transaction;
    }
    beginTransaction() {
        if (this.isTransaction) {
            console.group("Reistate:Instructor");
            console.error("In same time you can begin only one transaction");
            console.error("transaction: ", this.transaction);
            console.groupEnd();
            return;
        }
        this.transaction = [];
        this.isTransaction = true;
    }
    flush() {
        if (!this.isTransaction) {
            console.group("Reistate:Instructor");
            console.warn("Running flush before beginTransaction, logical mistake?");
            console.groupEnd();
            return;
        }
        this.store.update(this.transaction[Symbol.iterator]());
        this.isTransaction = false;
    }
    undoTransaction() {
        if (!this.isTransaction) {
            console.group("Reistate:Instructor");
            console.warn("Running undoTransaction before beginTransaction, logical mistake?");
            console.groupEnd();
            return;
        }
        this.isTransaction = false;
    }
    inject(injection) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createInject(injection));
        }
        else {
            this.store.update([Instructor.createInject(injection)][Symbol.iterator]());
        }
    }
    set(path, value, ...pathArgs) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createSet(path, value, ...pathArgs));
        }
        else {
            this.store.update([Instructor.createSet(path, value, ...pathArgs)][Symbol.iterator]());
        }
    }
    add(path, value, ...pathArgs) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createAdd(path, value, ...pathArgs));
        }
        else {
            this.store.update([Instructor.createAdd(path, value, ...pathArgs)][Symbol.iterator]());
        }
    }
    remove(path, index, ...pathArgs) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createRemove(path, index, ...pathArgs));
        }
        else {
            this.store.update([Instructor.createRemove(path, index, ...pathArgs)][Symbol.iterator]());
        }
    }
    static createInject(injection) {
        return { type: InstructionType_1.InstructionType.inject, injection };
    }
    static createSet(path, value, ...pathArgs) {
        return { path, args: pathArgs, value, type: InstructionType_1.InstructionType.set };
    }
    static createAdd(path, value, ...pathArgs) {
        return { path, args: pathArgs, value, type: InstructionType_1.InstructionType.add };
    }
    static createRemove(path, index, ...pathArgs) {
        return { path, args: pathArgs, index, type: InstructionType_1.InstructionType.remove };
    }
}
exports.Instructor = Instructor;
//# sourceMappingURL=Instructor.js.map