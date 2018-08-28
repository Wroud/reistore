import { INodeAccessor, INode, IUndo } from "./INode";
import { Handler } from "./IUpdateHandler";
export interface INodeSubscriber<TRoot> {
    node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>;
    strict: boolean;
    handler: Handler<TRoot>;
    update(state: TRoot, change: IUndo<TRoot, any>): any;
    unSubscribe(): any;
}
