"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
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
                    if (typeof index === "function") {
                        curValue = path.get(this.stateStore, []);
                        if (!Array.isArray(curValue)) {
                            const newIndex = index(curValue);
                            path.setImmutable(this.stateStore, Object.assign({}, curValue, { [newIndex]: value }));
                            break;
                        }
                        const newValue = [...curValue];
                        const newIndex = index(curValue);
                        newValue[newIndex] = value;
                        path.setImmutable(this.stateStore, newValue);
                    }
                    else if (index !== undefined) {
                        curValue = path.get(this.stateStore, []);
                        if (!Array.isArray(curValue)) {
                            path.setImmutable(this.stateStore, Object.assign({}, curValue, { [index]: value }));
                            break;
                        }
                        const newValue = [...curValue];
                        newValue[index] = value;
                        path.setImmutable(this.stateStore, newValue);
                    }
                    else {
                        path.setImmutable(this.stateStore, value);
                    }
                    break;
                case InstructionType_1.InstructionType.add:
                    curValue = path.get(this.stateStore, []);
                    if (typeof index === "function") {
                        if (!Array.isArray(curValue)) {
                            const newIndex = index(curValue);
                            path.setImmutable(this.stateStore, Object.assign({}, curValue, { [newIndex]: value }));
                            break;
                        }
                        const newValue = [...curValue];
                        const newIndex = index(curValue);
                        newValue[newIndex] = value;
                        path.setImmutable(this.stateStore, newValue);
                    }
                    else if (index !== undefined) {
                        if (!Array.isArray(curValue)) {
                            path.setImmutable(this.stateStore, Object.assign({}, curValue, { [index]: value }));
                            break;
                        }
                        const newValue = [...curValue];
                        newValue[index] = value;
                        path.setImmutable(this.stateStore, newValue);
                    }
                    else {
                        path.setImmutable(this.stateStore, [...curValue, value]);
                    }
                    break;
                case InstructionType_1.InstructionType.remove:
                    if (index === undefined) {
                        break;
                    }
                    curValue = path.get(this.stateStore, []);
                    if (!Array.isArray(curValue)) {
                        const id = typeof index === "function"
                            ? index(curValue)
                            : index;
                        const _a = id, _ = curValue[_a], newValue = __rest(curValue, [typeof _a === "symbol" ? _a : _a + ""]);
                        path.setImmutable(this.stateStore, newValue);
                    }
                    else {
                        if (typeof index === "function") {
                            path.setImmutable(this.stateStore, curValue.filter(index));
                        }
                        else {
                            path.setImmutable(this.stateStore, curValue.filter((v, i) => i !== index));
                        }
                    }
                    break;
            }
        }
        this.updateHandler.update();
    }
}
exports.Store = Store;
//# sourceMappingURL=Store.js.map