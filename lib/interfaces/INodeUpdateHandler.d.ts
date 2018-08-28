import { INodeAccessor, INode, IUndo } from "./INode";
import { INodeSubscriber } from "./INodeSubscriber";
export interface INodeUpdateHandler<TRoot> {
    node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>;
    subscribe(subscriber: INodeSubscriber<TRoot>): any;
    unSubscribe(subscriber: INodeSubscriber<TRoot>): any;
    update(state: TRoot, change: IUndo<TRoot, any>, fromChildren: boolean): void;
}
