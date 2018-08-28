"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NodeUpdateHandler {
    constructor(updateHandler, node) {
        this.updateHandler = updateHandler;
        this.node = node;
        this.strictHandlers = [];
        this.handlers = [];
    }
    update(state, change, fromChildren) {
        if (!fromChildren) {
            for (const handler of this.strictHandlers) {
                handler.update(state, change);
            }
        }
        for (const handler of this.handlers) {
            handler.update(state, change);
        }
        let parent = this.node.node.parent;
        while (parent !== undefined) {
            let next = this.updateHandler.getNodeHandler(parent);
            if (next !== undefined) {
                next.update(state, change, true);
                break;
            }
            parent = parent.parent;
        }
    }
    subscribe(subscriber) {
        if (subscriber.strict) {
            this.strictHandlers.push(subscriber);
        }
        else {
            this.handlers.push(subscriber);
        }
        return this;
    }
    unSubscribe(handler) {
        var source = handler.strict ? this.strictHandlers : this.handlers;
        const id = source.indexOf(handler);
        if (id > -1) {
            source.splice(id, 1);
        }
        return this;
    }
}
exports.NodeUpdateHandler = NodeUpdateHandler;
//# sourceMappingURL=NodeUpdateHandler.js.map