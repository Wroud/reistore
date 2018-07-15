import { IUpdateHandler, Handler, IPath } from "./interfaces";
export declare class UpdateHandler<TStore> implements IUpdateHandler<TStore> {
    private handlers;
    constructor();
    update(state: TStore, updateList: IPath<TStore, any>[]): void;
    subscribe(handler: Handler<TStore>): this;
    unSubscribe(handler: Handler<TStore>): this;
}
