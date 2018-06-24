import { IUpdateHandler, Handler } from "./IUpdateHandler";
import { IInstructor } from "./IInstructor";
import { IInstruction } from "./IInstruction";
export interface IStore<TState> {
    state: TState;
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    update(instructins: IterableIterator<IInstruction<TState, any>>): any;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
