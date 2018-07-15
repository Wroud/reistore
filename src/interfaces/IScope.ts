import { IPath, PathSelector } from "./IPath";
import { ISchema, Transformator } from "./ISchema";

export interface IScope<TState, TParent, TScope> {
    parent: ISchema<TState, TParent>;
    schema: ISchema<TState, TState>;
    path: IPath<TState, TScope>;
    joinPath<T>(path: IPath<TScope, T> | PathSelector<TScope, T>): IPath<TState, T>
    createScope<TNewScope>(
        scope: IPath<TScope, TNewScope> | PathSelector<TScope, TNewScope>, 
        initState?: TNewScope,
        transformator?: Transformator<TState, TNewScope>, 
        mutateParent?: boolean
    ): IScope<TState, TScope, TNewScope>;
}
