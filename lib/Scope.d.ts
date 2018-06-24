import { IScope, IPath, Transformator, PathSelector, ISchema, IStore } from "./interfaces";
import { Schema } from "./Schema";
export declare class Scope<TState, TParent, TScope> extends Schema<TState, TScope> implements IScope<TState, TParent, TScope> {
    parent: ISchema<TState, TParent>;
    schema: ISchema<TState, TState>;
    path: IPath<TState, TScope>;
    constructor(parent: ISchema<TState, TParent>, path: IPath<TState, TScope>, initState?: TScope, transformator?: Transformator<TState, TScope>, mutateParent?: boolean);
    setInitState(store: IStore<TState>): void;
    getState(state: TState | IStore<TState>): TScope;
    createScope<TNewScope>(scope: IPath<TScope, TNewScope> | PathSelector<TScope, TNewScope>, initState?: TNewScope, transformator?: Transformator<TState, TNewScope>, mutateParent?: boolean): IScope<TState, TScope, TNewScope>;
}
export declare function createScope<TState, TModel, TScope>(parent: ISchema<TState, TModel>, path: IPath<TState, TScope> | PathSelector<TState, TScope>, initState?: TScope, transformator?: Transformator<TState, TScope>, mutateParent?: boolean): Scope<TState, TModel, TScope>;
export declare function isScope<TStore, TModel, TScope>(object: any): object is IScope<TStore, TModel, TScope>;
