import { IUpdateHandler, Handler } from "./IUpdateHandler";
import { IBatch } from "./IInstructor";
import { IInstruction } from "./IInstruction";
import { IPath, PathArg } from "./IPath";

export interface IStore<TState> {
    state: TState;
    instructor: IBatch<TState>;
    updateHandler: IUpdateHandler<TState>;
    get<TValue>(path: IPath<TState, TValue>, ...pathArgs: PathArg[]);
    update(instructins: IterableIterator<IInstruction<TState, any>>);
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}

export type IStoreInstructor<TState> = IStore<TState> & IBatch<TState>;
