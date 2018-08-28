import { IUndo, INode, IAccessorContainer } from "./INode";
import { INodeUpdateHandler } from "./INodeUpdateHandler";
import { INodeSubscriber } from "./INodeSubscriber";
export declare type Handler<TState> = (state: TState, change: IUndo<TState, any>) => void;
export declare type StoreHandler<TState> = (state: TState, changes: IUndo<TState, any>[]) => void;
export interface IUpdateHandler<TRoot> {
    update(state: TRoot, updateList: IUndo<TRoot, any>[]): void;
    getNodeHandler(node: INode<TRoot, any, any, any, any>): INodeUpdateHandler<TRoot> | undefined;
    subscribe(handler: StoreHandler<TRoot>): this;
    subscribe(handler: Handler<TRoot>, node: IAccessorContainer<TRoot, INode<TRoot, any, any, any, any>>, strict?: boolean): INodeSubscriber<TRoot>;
    unSubscribe(handler: StoreHandler<TRoot>): this;
}
