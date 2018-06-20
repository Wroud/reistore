"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UpdateHandler {
    constructor() {
        this.handlers = [];
    }
    update() {
        for (const handler of this.handlers) {
            handler();
        }
    }
    subscribe(handler) {
        this.handlers.push(handler);
    }
    unSubscribe(handler) {
        const id = this.handlers.indexOf(handler);
        if (id > -1) {
            this.handlers.splice(id, 1);
        }
    }
}
exports.UpdateHandler = UpdateHandler;
//# sourceMappingURL=UpdateHandler.js.map