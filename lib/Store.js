"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
const Instructor_1 = require("./Instructor");
const tools_1 = require("./tools");
const Transformer_1 = require("./Transformer");
const UpdateHandler_1 = require("./UpdateHandler");
class Store {
    constructor(initState = {}, transformator) {
        this.isInstruction = (instruction) => (path, strict) => {
            return instruction.path.includes(path, strict);
        };
        this.stateStore = initState;
        this.transformator = transformator;
        this.instructor = new Instructor_1.Instructor(this);
        this.updateHandler = new UpdateHandler_1.UpdateHandler();
        this.scopes = [];
    }
    get state() {
        return this.stateStore;
    }
    transform(instructions) {
        if (this.transformator === undefined) {
            for (const scope of this.scopes) {
                instructions = scope.transform(instructions);
            }
            return instructions;
        }
        instructions = tools_1.exchangeIterator(instructions, instruction => {
            const transformer = new Transformer_1.Transformer(instruction);
            this.transformator(instruction, this.isInstruction(instruction), transformer, this.stateStore);
            return transformer.toIterator();
        });
        for (const scope of this.scopes) {
            instructions = scope.transform(instructions);
        }
        return instructions;
    }
    update(instructions) {
        instructions = this.transform(instructions);
        this.stateStore = Object.assign({}, this.stateStore);
        for (const { type, path, value, index } of instructions) {
            let curValue;
            switch (type) {
                case InstructionType_1.InstructionType.set:
                    path.setImmutable(this.stateStore, value);
                    break;
                case InstructionType_1.InstructionType.add:
                    curValue = path.get(this.stateStore, []);
                    if (typeof index === "function") {
                        const newValue = [...curValue];
                        const newIndex = index(curValue);
                        newValue[newIndex] = value;
                        path.setImmutable(this.stateStore, newValue);
                    }
                    else if (index !== undefined) {
                        const newValue = [...curValue];
                        newValue[index] = value;
                        path.setImmutable(this.stateStore, newValue);
                    }
                    else {
                        path.setImmutable(this.stateStore, [...curValue, value]);
                    }
                    break;
                case InstructionType_1.InstructionType.remove:
                    curValue = path.get(this.stateStore, []);
                    if (typeof index === "function") {
                        path.setImmutable(this.stateStore, curValue.filter(index));
                    }
                    else {
                        path.setImmutable(this.stateStore, curValue.filter((v, i) => i !== index));
                    }
                    break;
            }
        }
        this.updateHandler.update();
    }
    addScope(scope) {
        this.scopes.push(scope);
    }
    removeScope(scope) {
        const id = this.scopes.indexOf(scope);
        if (id > -1) {
            this.scopes.splice(id, 1);
        }
    }
}
exports.Store = Store;
//# sourceMappingURL=Store.js.map