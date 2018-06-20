"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
class Transformer {
    constructor(instruction) {
        this.instruction = instruction;
        this.instructions = [];
    }
    set(path, value) {
        this.instructions.push({ path, value, type: InstructionType_1.InstructionType.set });
    }
    add(path, value, index) {
        this.instructions.push({ path, index, value, type: InstructionType_1.InstructionType.add });
    }
    remove(path, index) {
        this.instructions.push({ path, index, type: InstructionType_1.InstructionType.remove });
    }
    applyInstruction() {
        this.instructions.push(this.instruction);
    }
    toIterator() {
        return this.instructions[Symbol.iterator]();
    }
}
exports.Transformer = Transformer;
//# sourceMappingURL=Transformer.js.map