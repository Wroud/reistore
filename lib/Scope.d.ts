import { IScope, IPath, IStoreSchema, Transformator, PathSelector } from "./interfaces";
import { StoreSchema } from "./StoreSchema";
import { IStore } from "./interfaces/IStore";
export declare class Scope<TState, TModel, TScope> extends StoreSchema<TState, TScope> implements IScope<TState, TModel, TScope> {
    parent: IStoreSchema<TState, TModel>;
    store: IStoreSchema<TState, TState>;
    path: IPath<TState, TScope>;
    constructor(parent: IStoreSchema<TState, TModel>, path: IPath<TState, TScope>, transformator?: Transformator<TState, TScope>);
    getState(state: TState | IStore<TState>): TScope;
    createScope<TNewScope>(scope: IPath<TScope, TNewScope> | PathSelector<TScope, TNewScope>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope>;
}
export declare function createScope<TState, TModel, TScope>(parent: IStoreSchema<TState, TModel>, path: IPath<TState, TScope> | PathSelector<TState, TScope>, transformator?: Transformator<TState, TScope>): Scope<TState, TModel, TScope>;
export declare function isScope<TStore, TModel, TScope>(object: any): object is IScope<TStore, TModel, TScope>;
