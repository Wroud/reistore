import { IUpdateHandler, Handler, IUndo } from "./interfaces";

export class UpdateHandler<TState> implements IUpdateHandler<TState> {
    private handlers: Array<Handler<TState>>;
    constructor() {
        this.handlers = [];
    }
    update(state: TState, updateList: IUndo<TState, any>[]) {
        for (const handler of this.handlers) {
            handler(state, updateList);
        }
    }
    subscribe(handler: Handler<TState>) {
        this.handlers.push(handler);
        return this;
    }
    unSubscribe(handler: Handler<TState>) {
        const id = this.handlers.indexOf(handler);
        if (id > -1) {
            this.handlers.splice(id, 1);
        }
        return this;
    }
}
