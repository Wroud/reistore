"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Instructor_1 = require("./Instructor");
const UpdateHandler_1 = require("./UpdateHandler");
const interfaces_1 = require("./interfaces");
const Schema_1 = require("./Schema");
const Transformer_1 = require("./Transformer");
const Node_1 = require("./Node");
const NodeSubscriber_1 = require("./NodeSubscriber");
class Store {
    constructor(initState, schema, transformator) {
        this.get = (node) => {
            if (Node_1.isCountainer(node)) {
                return node[interfaces_1.PathNode].get(this.stateStore);
            }
            else {
                return node.get(this.stateStore);
            }
        };
        this.set = (node, value) => {
            this.instructor.set(node, value);
        };
        this.add = (node, value) => {
            this.instructor.add(node, value);
        };
        this.remove = (node) => {
            this.instructor.remove(node);
        };
        this.batch = (batch) => {
            if (this.isUpdating()) {
                return;
            }
            this._isUpdating = true;
            this.updateList = [];
            batch(this.transformer);
            this.updateHandler.update(this.stateStore, this.updateList);
            this._isUpdating = false;
        };
        this._isUpdating = false;
        this.stateStore = initState || {};
        this.schema = schema || new Schema_1.Schema(transformator);
        this.transformer = new Transformer_1.Transformer(this, this.schema.transform);
        this.instructor = new Instructor_1.Instructor(this);
        this.updateHandler = new UpdateHandler_1.UpdateHandler();
    }
    get state() {
        return this.stateStore;
    }
    set state(value) {
        this.stateStore = value;
    }
    update(instructions) {
        if (this.isUpdating()) {
            return;
        }
        this._isUpdating = true;
        this.updateList = [];
        this.schema.transform(this, instructions);
        this.updateHandler.update(this.stateStore, this.updateList);
        this._isUpdating = false;
    }
    addChange(change) {
        this.updateList.push(change);
    }
    subscribe(handler, node, strict) {
        var sub = this.updateHandler.subscribe(handler, node, strict);
        if (sub instanceof NodeSubscriber_1.NodeSubscriber) {
            return sub;
        }
        return this;
    }
    unSubscribe(handler) {
        this.updateHandler.unSubscribe(handler);
        return this;
    }
    isUpdating() {
        if (this._isUpdating) {
            console.group("Reistate:Store");
            console.error("Trying to run update before last update finished, asynchronous problem?");
            console.error("store: ", this);
            console.groupEnd();
        }
        return this._isUpdating;
    }
}
exports.Store = Store;
function createStore(initState, schema, transformator) {
    return new Store(initState, schema, transformator);
}
exports.createStore = createStore;
//# sourceMappingURL=Store.js.map