import { IInstruction, IInstructor, IUpdateHandler, IPath, Handler } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg, PathValue } from "./interfaces/IPath";
import { ISchema, Transformator } from "./interfaces/ISchema";
declare type IStoreInstructor<TState> = IStore<TState> & IInstructor<TState>;
export declare class Store<TState> implements IStoreInstructor<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState, TState>;
    private stateStore;
    private isUpdating;
    constructor(schema?: ISchema<TState, TState>, initState?: TState, transformator?: Transformator<TState, TState>);
    state: TState;
    beginTransaction(): void;
    flush(): void;
    undoTransaction(): void;
    set<TValue>(path: IPath<TState, TValue>, value: PathValue<TValue>, pathArgs?: PathArg[]): void;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: PathValue<TValue>, pathArgs?: PathArg[]): void;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, pathArgs?: PathArg[]): void;
    update(instructions: IterableIterator<IInstruction<TState, any>>): void;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
export declare function createStore<TState>(schema?: ISchema<TState, TState>, initState?: TState, transformator?: Transformator<TState, TState>): Store<TState>;
export {};
