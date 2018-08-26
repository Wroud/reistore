import { ISchema, Transformator } from "./ISchema";
import { INode } from "./INode";

export interface IScope<TState extends object | any[] | Map<any, any>, TParent, TScope>
    extends ISchema<TState> {
    node: INode<TState, TParent, TScope, any, any>;
    createScope<TNewScope>(
        node: INode<TState, TScope, TNewScope, any, any>,
        transformator?: Transformator<TState, TNewScope>
    ): IScope<TState, TScope, TNewScope>;
}
