"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InstructionType_1 = require("./enums/InstructionType");
const Instructor_1 = require("./Instructor");
const UpdateHandler_1 = require("./UpdateHandler");
class Store {
    constructor(schema, initState) {
        this.schema = schema;
        if (initState === undefined) {
            this.stateStore = {};
        }
        else {
            this.stateStore = initState;
        }
        this.instructor = new Instructor_1.Instructor(this);
        this.updateHandler = new UpdateHandler_1.UpdateHandler();
    }
    get state() {
        return this.stateStore;
    }
    update(instructions) {
        this.stateStore = Object.assign({}, this.stateStore);
        instructions = this.schema.transform(this.stateStore, instructions);
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
}
exports.Store = Store;
//# sourceMappingURL=Store.js.map