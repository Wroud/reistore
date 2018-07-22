import { Instruction } from "Instruction";

export type Handler<TState> = (state: TState, updateList: Instruction<TState, any>[]) => void
export interface IUpdateHandler<TState> {
    update: Handler<TState>;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
