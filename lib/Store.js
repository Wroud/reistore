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
const StoreSchema_1 = require("./StoreSchema");
class Store {
    constructor(schema, initState, transformator, isImmutable = true) {
        if (!schema) {
            schema = new StoreSchema_1.StoreSchema(initState, transformator);
        }
        if (initState) {
            this.stateStore = Object.assign({}, initState);
        }
        this.isImmutable = isImmutable;
        this.isInjecting = false;
        this.isUpdating = false;
        this.schema = schema;
        this.instructor = new Instructor_1.Instructor(this);
        this.updateHandler = new UpdateHandler_1.UpdateHandler();
        this.schema.setInitState(this);
    }
    get state() {
        return this.stateStore;
    }
    set state(value) {
        this.stateStore = value;
    }
    batch(batch) {
        this.instructor.batch(batch);
    }
    get(path, ...pathArgs) {
        return path.get(this.stateStore, undefined, pathArgs);
    }
    set(path, value, ...pathArgs) {
        this.instructor.set(path, value, ...pathArgs);
    }
    add(path, value, ...pathArgs) {
        this.instructor.add(path, value, ...pathArgs);
    }
    remove(path, index, ...pathArgs) {
        this.instructor.remove(path, index, ...pathArgs);
    }
    update(instructions) {
        if (this.isInjecting) {
            this.transformState(instructions);
            return;
        }
        if (this.isUpdating) {
            console.group("Reistate:Store");
            console.error("Trying to run update before last update finished, asynchronous problem?");
            console.error("store: ", this);
            console.groupEnd();
            return;
        }
        this.isUpdating = true;
        if (this.isImmutable) {
            this.stateStore = Object.assign({}, this.stateStore);
        }
        this.updateList = [];
        this.transformState(instructions);
        this.updateHandler.update(this.stateStore, this.updateList);
        this.isUpdating = false;
    }
    transformState(instructions) {
        instructions = this.schema.transform(this.stateStore, instructions);
        for (const instruction of instructions) {
            const { type, path, value, index, args, injection } = instruction;
            switch (type) {
                case InstructionType_1.InstructionType.inject:
                    if (!injection) {
                        break;
                    }
                    if (this.isInjecting) {
                        injection(this.stateStore, this);
                    }
                    else {
                        this.isInjecting = true;
                        injection(this.stateStore, this);
                        this.isInjecting = false;
                    }
                    break;
                case InstructionType_1.InstructionType.set:
                case InstructionType_1.InstructionType.add:
                    if (path) {
                        this.updateList.push(instruction);
                        if (this.isImmutable) {
                            path.setImmutable(this.stateStore, value, args);
                        }
                        else {
                            path.set(this.stateStore, value, args);
                        }
                    }
                    break;
                case InstructionType_1.InstructionType.remove:
                    if (index === undefined) {
                        console.error("You need specify index for removing element");
                        break;
                    }
                    if (path) {
                        this.updateList.push(instruction);
                        if (this.isImmutable) {
                            path.setImmutable(this.stateStore, curValue => {
                                if (!Array.isArray(curValue)) {
                                    const id = typeof index === "function"
                                        ? index(curValue)
                                        : index;
                                    const _a = id, _ = curValue[_a], newValue = __rest(curValue, [typeof _a === "symbol" ? _a : _a + ""]);
                                    return newValue;
                                }
                                else if (typeof index === "function") {
                                    return curValue.filter(index);
                                }
                                else {
                                    return curValue.filter((v, i) => i !== index);
                                }
                            }, args);
                        }
                        else {
                            path.set(this.stateStore, curValue => {
                                if (!Array.isArray(curValue)) {
                                    const id = typeof index === "function"
                                        ? index(curValue)
                                        : index;
                                    const _a = id, _ = curValue[_a], newValue = __rest(curValue, [typeof _a === "symbol" ? _a : _a + ""]);
                                    return newValue;
                                }
                                else if (typeof index === "function") {
                                    return curValue.filter(index);
                                }
                                else {
                                    return curValue.filter((v, i) => i !== index);
                                }
                            }, args);
                        }
                    }
                    break;
            }
        }
    }
    subscribe(handler) {
        this.updateHandler.subscribe(handler);
        return this;
    }
    unSubscribe(handler) {
        this.updateHandler.unSubscribe(handler);
        return this;
    }
}
exports.Store = Store;
function createStore(schema, initState, transformator, isImmutable = true) {
    return new Store(schema, initState, transformator, isImmutable);
}
exports.createStore = createStore;
//# sourceMappingURL=Store.js.map