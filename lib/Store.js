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
    constructor(schema, initState, transformator) {
        if (!schema) {
            schema = new StoreSchema_1.StoreSchema(initState, transformator);
        }
        if (initState) {
            this.stateStore = Object.assign({}, initState);
        }
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
    getTransaction() {
        return this.instructor.getTransaction();
    }
    beginTransaction() {
        this.instructor.beginTransaction();
    }
    flush() {
        this.instructor.flush();
    }
    undoTransaction() {
        this.instructor.undoTransaction();
    }
    inject(injection) {
        this.instructor.inject(injection);
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
        if (this.isUpdating) {
            console.group("Reistate:Store");
            console.error("Trying to run update before last update finished, asynchronous problem?");
            console.error("store: ", this);
            console.groupEnd();
            return;
        }
        this.isUpdating = true;
        this.stateStore = Object.assign({}, this.stateStore);
        this.transformState(instructions);
        this.updateHandler.update(this.stateStore);
        this.isUpdating = false;
    }
    transformState(instructions) {
        instructions = this.schema.transform(this.stateStore, instructions);
        for (const { type, path, value, index, args, injection } of instructions) {
            switch (type) {
                case InstructionType_1.InstructionType.inject:
                    if (injection) {
                        const inject = new Instructor_1.Instructor(this);
                        inject.beginTransaction();
                        injection(this.stateStore, inject);
                        this.transformState(inject.getTransaction()[Symbol.iterator]());
                    }
                    break;
                case InstructionType_1.InstructionType.set:
                case InstructionType_1.InstructionType.add:
                    if (path) {
                        path.setImmutable(this.stateStore, value, args);
                    }
                    break;
                case InstructionType_1.InstructionType.remove:
                    if (index === undefined) {
                        console.error("You need specify index for removing element");
                        break;
                    }
                    if (path) {
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
function createStore(schema, initState, transformator) {
    return new Store(schema, initState, transformator);
}
exports.createStore = createStore;
//# sourceMappingURL=Store.js.map