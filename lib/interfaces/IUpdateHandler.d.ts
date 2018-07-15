import { IPath } from "./IPath";
export declare type Handler<TState> = (state: TState, updateList: IPath<TState, any>[]) => void;
export interface IUpdateHandler<TState> {
    update: Handler<TState>;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
