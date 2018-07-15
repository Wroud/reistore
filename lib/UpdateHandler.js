"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UpdateHandler {
    constructor() {
        this.handlers = [];
    }
    update(state, updateList) {
        for (const handler of this.handlers) {
            handler(state, updateList);
        }
    }
    subscribe(handler) {
        this.handlers.push(handler);
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