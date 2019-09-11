import { ISubscriber } from "../subscription/ISubscriber";
import { IGetNode, INode } from "./INode";

export type Computed<TRoot, TParent, TArguments extends any[], TValue> = (
    subscriber: TRoot,
    parent: TParent,
    ...args: TArguments
) => TValue;

export interface IComputedNode<
    TParent extends INode<any>,
    TRoot,
    TModel,
    TValue,
    TArguments extends any[]
    >
    extends IGetNode<TParent, ISubscriber<TRoot>, TValue> {
    func: Computed<ISubscriber<TRoot>, TModel, TArguments, TValue>;
}
