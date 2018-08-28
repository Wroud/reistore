"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NodeSubscriber {
    constructor(updateHandler, handler, node, strict) {
        this.updateHandler = updateHandler;
        this._handler = handler;
        this._node = node;
        this._strict = strict;
    }
    get node() {
        return this._node;
    }
    get strict() {
        return this._strict;
    }
    get handler() {
        return this._handler;
    }
    update(state, change) {
        if (change.in(this._node, this._strict)) {
            this._handler(state, change);
        }
    }
    unSubscribe() {
        this.updateHandler.unSubscribe(this);
    }
}
exports.NodeSubscriber = NodeSubscriber;
//# sourceMappingURL=NodeSubscriber.js.map