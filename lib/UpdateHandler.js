"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const Node_1 = require("./Node");
const NodeSubscriber_1 = require("./NodeSubscriber");
const NodeUpdateHandler_1 = require("./NodeUpdateHandler");
class UpdateHandler {
    constructor() {
        this.handlers = [];
        this.nodeHandler = new Map();
    }
    update(state, changes) {
        for (const handler of this.handlers) {
            handler(state, changes);
        }
        for (const change of changes) {
            const handler = this.nodeHandler.get(change.node);
            if (handler !== undefined) {
                handler.update(state, change, false);
            }
            else {
                let parent = change.node.parent;
                while (parent !== undefined) {
                    const handler = this.nodeHandler.get(parent);
                    if (handler !== undefined) {
                        handler.update(state, change, true);
                        break;
                    }
                    parent = parent.parent;
                }
            }
        }
    }
    getNodeHandler(node) {
        return this.nodeHandler.get(node);
    }
    subscribe(handler, node, strict) {
        if (node !== undefined) {
            let accessor = node;
            if (Node_1.isCountainer(node)) {
                accessor = node[interfaces_1.PathNode];
            }
            let subscriber = this.nodeHandler.get(accessor.node);
            if (subscriber === undefined) {
                subscriber = new NodeUpdateHandler_1.NodeUpdateHandler(this, accessor.node);
                this.nodeHandler.set(accessor.node, subscriber);
            }
            const subscription = new NodeSubscriber_1.NodeSubscriber(subscriber, handler, accessor, strict || false);
            subscriber.subscribe(subscription);
            return subscription;
        }
        else {
            this.handlers.push(handler);
        }
        return this;
    }
    unSubscribe(handler) {
        const id = this.handlers.indexOf(handler);
        if (id > -1) {
            this.handlers.splice(id, 1);
        }
        return this;
    }
}
exports.UpdateHandler = UpdateHandler;
//# sourceMappingURL=UpdateHandler.js.map