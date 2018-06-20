import { IPath } from "./IPath";
import { IStore, Transformator } from "./IStore";
export interface IScope<TState, TModel, TScope> extends IStore<TState, TScope> {
    parent: IStore<TState, TModel>;
    store: IStore<TState, TState>;
    path: IPath<TState, TScope>;
    createScope<TNewScope>(scope: IPath<TScope, TNewScope>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope>;
}
