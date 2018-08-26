import { IUpdateHandler, Handler, IUndo } from "./interfaces";
export declare class UpdateHandler<TState> implements IUpdateHandler<TState> {
    private handlers;
    constructor();
    update(state: TState, updateList: IUndo<TState, any>[]): void;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
