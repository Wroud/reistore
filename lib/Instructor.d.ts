import { IInstructor, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
export declare class Instructor<TState> implements IInstructor<TState> {
    private store;
    constructor(store: IStore<TState>);
    set<TValue>(path: IPath<TState, TValue>, value: TValue): void;
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | ((value: TValue[]) => string | number)): void;
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | ((value: TValue, index: string | number) => boolean)): void;
}
