import { IScope, Transformator, ISchema, INode, IInstruction, IStore, ICountainer } from "./interfaces";
import { Schema } from "./Schema";
export declare class Scope<TState extends object | any[] | Map<any, any>, TParent, TScope> extends Schema<TState> implements IScope<TState, TParent, TScope> {
    private parent;
    private _schema;
    node: INode<TState, TParent, TScope, any, any>;
    constructor(parent: ISchema<TState>, node: INode<TState, TParent, TScope, any, any> | ICountainer<INode<TState, TParent, TScope, any, any>>, transformator?: Transformator<TState, TScope>);
    readonly schema: ISchema<TState>;
    transform(store: IStore<TState>, change: IInstruction<TState, any>): void;
    createScope<TNewScope>(node: INode<TState, TScope, TNewScope, any, any> | ICountainer<INode<TState, TScope, TNewScope, any, any>>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope>;
}
export declare function createScope<TState extends object | any[] | Map<any, any>, TModel, TScope>(parent: ISchema<TState>, node: INode<TState, TModel, TScope, any, any> | ICountainer<INode<TState, TModel, TScope, any, any>>, transformator?: Transformator<TState, TScope>): Scope<TState, TModel, TScope>;
export declare function isScope<TStore extends object | any[] | Map<any, any>, TModel, TScope>(object: any): object is IScope<TStore, TModel, TScope>;
