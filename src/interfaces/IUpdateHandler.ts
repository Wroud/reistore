import { IInstruction } from "./IInstruction";

export type Handler<TState> = (state: TState, updateList: IInstruction<TState, any>[]) => void
export interface IUpdateHandler<TState> {
    update: Handler<TState>;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
