import { IUpdateHandler, Handler } from "./interfaces";
import { Instruction } from "./Instruction";
export declare class UpdateHandler<TStore> implements IUpdateHandler<TStore> {
    private handlers;
    constructor();
    update(state: TStore, updateList: Instruction<TStore, any>[]): void;
    subscribe(handler: Handler<TStore>): this;
    unSubscribe(handler: Handler<TStore>): this;
}
