import { IUpdateHandler, Handler } from "./interfaces";
export declare class UpdateHandler<TStore> implements IUpdateHandler<TStore> {
    private handlers;
    constructor();
    update(state: TStore): void;
    subscribe(handler: Handler<TStore>): this;
    unSubscribe(handler: Handler<TStore>): this;
}
