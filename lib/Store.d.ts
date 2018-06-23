import { IInstruction, IInstructor, IStoreSchema, IUpdateHandler, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexGetter, IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
declare type IStoreInstructor<TState> = IStore<TState> & IInstructor<TState>;
export declare class Store<TState> implements IStoreInstructor<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler;
    schema: IStoreSchema<TState, TState>;
    private stateStore;
    constructor(schema?: IStoreSchema<TState, TState>, initState?: TState);
    readonly state: TState;
    set<TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): void;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): void;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[], index: string | number | IndexSearch<TValue>): void;
    update(instructions: IterableIterator<IInstruction<TState, any>>): void;
}
export declare function createStore<TState>(schema?: IStoreSchema<TState, TState>, initState?: TState): Store<TState>;
export {};
