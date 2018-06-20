import { IUpdateHandler } from "interfaces";

export class UpdateHandler implements IUpdateHandler {
    private handlers: Array<() => void>;
    constructor() {
        this.handlers = [];
    }
    update() {
        for (const handler of this.handlers) {
            handler();
        }
    }
    subscribe(handler: () => void) {
        this.handlers.push(handler);
    }
    unSubscribe(handler: () => void) {
        const id = this.handlers.indexOf(handler);
        if (id > -1) {
            this.handlers.splice(id, 1);
        }
    }
}
