"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
const Instruction_1 = require("./Instruction");
class Instructor {
    constructor(store) {
        this.store = store;
    }
    batch(batch) {
        this.beginTransaction();
        batch(this);
        this.flush();
    }
    inject(injection) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createInject(injection));
        }
        else {
            this.store.update([Instructor.createInject(injection)][Symbol.iterator]());
        }
    }
    set(path, value, ...pathArgs) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createSet(path, value, pathArgs));
        }
        else {
            this.store.update([Instructor.createSet(path, value, pathArgs)][Symbol.iterator]());
        }
    }
    add(path, value, ...pathArgs) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createAdd(path, value, pathArgs));
        }
        else {
            this.store.update([Instructor.createAdd(path, value, pathArgs)][Symbol.iterator]());
        }
    }
    remove(path, index, ...pathArgs) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createRemove(path, index, pathArgs));
        }
        else {
            this.store.update([Instructor.createRemove(path, index, pathArgs)][Symbol.iterator]());
        }
    }
    beginTransaction() {
        if (this.isBatch) {
            console.group("Reistate:Instructor");
            console.error("In same time you can begin only one batch");
            console.error("batch: ", this.batchInstructions);
            console.groupEnd();
            return;
        }
        this.batchInstructions = [];
        this.isBatch = true;
    }
    flush() {
        this.isBatch = false;
        this.store.update(this.batchInstructions[Symbol.iterator]());
    }
    static createInject(injection) {
        return new Instruction_1.Instruction(InstructionType_1.InstructionType.inject, undefined, undefined, undefined, undefined, injection);
    }
    static createSet(path, value, pathArgs) {
        return new Instruction_1.Instruction(InstructionType_1.InstructionType.set, path, undefined, pathArgs, value);
    }
    static createAdd(path, value, pathArgs) {
        return new Instruction_1.Instruction(InstructionType_1.InstructionType.add, path, undefined, pathArgs, value);
    }
    static createRemove(path, index, pathArgs) {
        return new Instruction_1.Instruction(InstructionType_1.InstructionType.remove, path, index, pathArgs);
    }
}
exports.Instructor = Instructor;
//# sourceMappingURL=Instructor.js.map