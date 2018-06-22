import { IInstructor, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexGetter, IndexSearch } from "./interfaces/IInstructor";
export declare class Instructor<TState> implements IInstructor<TState> {
    private store;
    constructor(store: IStore<TState>);
    set<TValue>(path: IPath<TState, TValue>, value: TValue, index?: string | number | IndexGetter<TValue>): void;
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | IndexGetter<TValue>): void;
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | IndexSearch<TValue>): void;
}
