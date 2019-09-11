import {
    IComputedNode,
    IGetNode, INode, NodeArgsMap,
    NodeType,
} from "../interfaces/node";
import { ISubscriber } from "../interfaces/subscription/ISubscriber";
import { Node } from "./Node";

export class ComputedNode<
    TParent extends INode<any, TRoot>,
    TRoot extends object | any[] | Map<any, any>,
    TModel,
    TValue,
    TArguments extends any[]
    >
    extends Node<TParent, TRoot>
    implements IComputedNode<TParent, TRoot, TModel, TValue, TArguments> {
    defaultValue?: () => TValue;
    func: (subscriber: ISubscriber<TRoot>, parent?: TModel, ...args: TArguments) => TValue;
    constructor(
        type: NodeType = NodeType.node,
        func: (subscriber: ISubscriber<TRoot>, parent?: TModel, ...args: TArguments) => TValue,
        parent?: TParent
    ) {
        super(type, undefined, parent);
        this.func = func;
    }
    get(
        subscriber: ISubscriber<TRoot>,
        args?: Map<INode<any, TRoot>, any>
    ): TValue | undefined {
        const parent = (this.parent as any as IGetNode<any, TRoot, TRoot, TModel>)
            .get(subscriber.store.state, args);
        const funcArgs = this.getArgs(args);
        return this.func(subscriber, parent, ...funcArgs);
    }
    getMultiple(
        subscriber: ISubscriber<TRoot>,
        args?: Map<INode<any, TRoot>, any> | undefined
    ): Array<TValue | undefined> {
        const parents = (this.parent as any as IGetNode<any, TRoot, TRoot, TModel>)
            .getMultiple(subscriber.store.state, args);

        const funcArgs = this.getArgs(args);
        return parents.map(parent => this.func(subscriber, parent, ...funcArgs));
    }
    protected getArgs(
        args?: NodeArgsMap<TRoot>
    ): TArguments {
        return args !== undefined ? args.get(this) : undefined;
    }
}
