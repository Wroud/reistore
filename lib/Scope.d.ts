import { IScope, IInstruction, IPath, IStore, Transformator } from "./interfaces";
import { Store } from "./Store";
export declare class Scope<TState, TModel, TScope> extends Store<TState, TScope> implements IScope<TState, TModel, TScope> {
    parent: IStore<TState, TModel>;
    store: IStore<TState, TState>;
    path: IPath<TState, TScope>;
    constructor(parent: IStore<TState, TModel>, path: IPath<TState, TScope>, transformator?: Transformator<TState, TScope>);
    readonly state: TScope;
    createScope<TNewScope>(scope: IPath<TScope, TNewScope>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope>;
    update(instructions: IterableIterator<IInstruction<TState, any>>): void;
}
export declare function isScope<TStore, TModel, TScope>(object: any): object is IScope<TStore, TModel, TScope>;
