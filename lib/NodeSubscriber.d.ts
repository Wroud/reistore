import { IUndo, Handler, INodeUpdateHandler, INode, INodeAccessor, INodeSubscriber } from "./interfaces";
export declare class NodeSubscriber<TRoot> implements INodeSubscriber<TRoot> {
    private _node;
    private _strict;
    private _handler;
    private updateHandler;
    constructor(updateHandler: INodeUpdateHandler<TRoot>, handler: Handler<TRoot>, node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>, strict: boolean);
    readonly node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>;
    readonly strict: boolean;
    readonly handler: Handler<TRoot>;
    update(state: TRoot, change: IUndo<TRoot, any>): void;
    unSubscribe(): void;
}
