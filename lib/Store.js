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
    constructor(schema, initState) {
        if (!schema) {
            schema = new StoreSchema_1.StoreSchema();
        }
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
    set(path, value, pathArgs, index) {
        this.instructor.set(path, value, pathArgs, index);
    }
    add(path, value, pathArgs, index) {
        this.instructor.add(path, value, pathArgs, index);
    }
    remove(path, pathArgs, index) {
        this.instructor.remove(path, pathArgs, index);
    }
    update(instructions) {
        this.stateStore = Object.assign({}, this.stateStore);
        instructions = this.schema.transform(this.stateStore, instructions);
        for (const { type, path, value, index, args } of instructions) {
            switch (type) {
                case InstructionType_1.InstructionType.set:
                    path.setImmutable(this.stateStore, value, args);
                    break;
                case InstructionType_1.InstructionType.add:
                    path.setImmutable(this.stateStore, value, index !== undefined ? [args, index] : args);
                    break;
                case InstructionType_1.InstructionType.remove:
                    if (index === undefined) {
                        break;
                    }
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
                    break;
            }
        }
        this.updateHandler.update();
    }
}
exports.Store = Store;
function createStore(schema, initState) {
    return new Store(schema, initState);
}
exports.createStore = createStore;
//# sourceMappingURL=Store.js.map