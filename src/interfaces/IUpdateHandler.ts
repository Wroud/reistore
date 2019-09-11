import { IAccessorContainer, INode, IUndo } from "./INode";
import { INodeSubscriber } from "./INodeSubscriber";
import { INodeUpdateHandler } from "./INodeUpdateHandler";

export type Handler<TState> = (state: TState, change: IUndo<TState, any>) => void;
export type StoreHandler<TState> = (state: TState, changes: Array<IUndo<TState, any>>) => void;
export interface IUpdateHandler<TRoot> {
    update(state: TRoot, updateList: Array<IUndo<TRoot, any>>): void;
    getNodeHandler(node: INode<TRoot, any, any, any, any>): INodeUpdateHandler<TRoot> | undefined;
    subscribe(
        handler: StoreHandler<TRoot>
    ): this;
    subscribe(
        handler: Handler<TRoot>,
        node: IAccessorContainer<TRoot, INode<TRoot, any, any, any, any>>,
        strict?: boolean
    ): INodeSubscriber<TRoot>;
    unSubscribe(handler: StoreHandler<TRoot>): this;
}
