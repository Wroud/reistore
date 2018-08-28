import { IUpdateHandler, Handler, IUndo, INodeUpdateHandler, INode, IAccessorContainer, StoreHandler } from "./interfaces";
export declare class UpdateHandler<TRoot> implements IUpdateHandler<TRoot> {
    private handlers;
    private nodeHandler;
    constructor();
    update(state: TRoot, changes: IUndo<TRoot, any>[]): void;
    getNodeHandler(node: INode<TRoot, any, any, any, any>): INodeUpdateHandler<TRoot> | undefined;
    subscribe(handler: Handler<TRoot> | StoreHandler<TRoot>, node?: IAccessorContainer<TRoot, INode<TRoot, any, any, any, any>>, strict?: boolean): any;
    unSubscribe(handler: StoreHandler<TRoot>): this;
}
