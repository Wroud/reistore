"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const InstructionType_1 = require("./enums/InstructionType");
const Instruction_1 = require("./Instruction");
const Node_1 = require("./Node");
class Transformer {
    constructor(store, applyChange, node) {
        this.apply = (instruction) => {
            this.applyChange(this.store, instruction);
        };
        this.set = (node, value) => {
            this.applyChange(this.store, new Instruction_1.Instruction(InstructionType_1.InstructionType.set, Node_1.isCountainer(node) ? node[interfaces_1.PathNode] : node, value));
        };
        this.add = (node, value) => {
            this.applyChange(this.store, new Instruction_1.Instruction(InstructionType_1.InstructionType.add, Node_1.isCountainer(node) ? node[interfaces_1.PathNode] : node, value));
        };
        this.remove = (node) => {
            this.applyChange(this.store, new Instruction_1.Instruction(InstructionType_1.InstructionType.remove, Node_1.isCountainer(node) ? node[interfaces_1.PathNode] : node, null));
        };
        this.node = node;
        this.store = store;
        this.applyChange = applyChange;
    }
    get scope() {
        if (this.node) {
            return this.store.get(this.node);
        }
        return undefined;
    }
    get state() {
        return this.store.state;
    }
}
exports.Transformer = Transformer;
//# sourceMappingURL=Transformer.js.map