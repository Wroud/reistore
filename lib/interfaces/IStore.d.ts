import { IUpdateHandler, Handler } from "./IUpdateHandler";
import { IInstructor } from "./IInstructor";
import { IInstruction } from "./IInstruction";
import { IPath, PathArg } from "./IPath";
export interface IStore<TState> {
    state: TState;
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    get<TValue>(path: IPath<TState, TValue>, ...pathArgs: PathArg[]): any;
    update(instructins: IterableIterator<IInstruction<TState, any>>): any;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
