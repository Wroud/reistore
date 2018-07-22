import { IUpdateHandler, Handler } from "./interfaces";
import { Instruction } from "./Instruction";

export class UpdateHandler<TStore> implements IUpdateHandler<TStore> {
    private handlers: Array<Handler<TStore>>;
    constructor() {
        this.handlers = [];
    }
    update(state: TStore, updateList: Instruction<TStore, any>[]) {
        for (const handler of this.handlers) {
            handler(state, updateList);
        }
    }
    subscribe(handler: Handler<TStore>) {
        this.handlers.push(handler);
        return this;
    }
    unSubscribe(handler: Handler<TStore>) {
        const id = this.handlers.indexOf(handler);
        if (id > -1) {
            this.handlers.splice(id, 1);
        }
        return this;
    }
}
