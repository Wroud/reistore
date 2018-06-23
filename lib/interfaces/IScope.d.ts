import { IPath, PathSelector } from "./IPath";
import { IStoreSchema, Transformator } from "./IStoreSchema";
export interface IScope<TState, TModel, TScope> extends IStoreSchema<TState, TScope> {
    parent: IStoreSchema<TState, TModel>;
    store: IStoreSchema<TState, TState>;
    path: IPath<TState, TScope>;
    createScope<TNewScope>(scope: IPath<TScope, TNewScope> | PathSelector<TScope, TNewScope>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope>;
}
