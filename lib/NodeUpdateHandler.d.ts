import { INodeSubscriber, IUndo, INodeAccessor, IUpdateHandler, INode, INodeUpdateHandler } from "./interfaces";
export declare class NodeUpdateHandler<TRoot> implements INodeUpdateHandler<TRoot> {
    node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>;
    private strictHandlers;
    private handlers;
    private updateHandler;
    constructor(updateHandler: IUpdateHandler<TRoot>, node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>);
    update(state: TRoot, change: IUndo<TRoot, any>, fromChildren: boolean): void;
    subscribe(subscriber: INodeSubscriber<TRoot>): this;
    unSubscribe(handler: INodeSubscriber<TRoot>): this;
}
