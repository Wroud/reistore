"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const Instruction_1 = require("./Instruction");
const InstructionType_1 = require("./enums/InstructionType");
const Node_1 = require("./Node");
class Instructor {
    constructor(store) {
        this.store = store;
    }
    get state() {
        return this.store.state;
    }
    set(node, value) {
        this.store.update(new Instruction_1.Instruction(InstructionType_1.InstructionType.set, Node_1.isCountainer(node) ? node[interfaces_1.PathNode] : node, value));
    }
    add(node, value) {
        this.store.update(new Instruction_1.Instruction(InstructionType_1.InstructionType.add, Node_1.isCountainer(node) ? node[interfaces_1.PathNode] : node, value));
    }
    remove(node) {
        this.store.update(new Instruction_1.Instruction(InstructionType_1.InstructionType.remove, Node_1.isCountainer(node) ? node[interfaces_1.PathNode] : node, null));
    }
}
exports.Instructor = Instructor;
//# sourceMappingURL=Instructor.js.map