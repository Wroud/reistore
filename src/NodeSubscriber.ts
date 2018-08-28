import { IUndo, Handler, INodeUpdateHandler, INode, INodeAccessor, INodeSubscriber } from "./interfaces";

export class NodeSubscriber<TRoot> implements INodeSubscriber<TRoot> {
    private _node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>;
    private _strict: boolean;
    private _handler: Handler<TRoot>;
    private updateHandler: INodeUpdateHandler<TRoot>;
    constructor(
        updateHandler: INodeUpdateHandler<TRoot>,
        handler: Handler<TRoot>,
        node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>,
        strict: boolean
    ) {
        this.updateHandler = updateHandler;
        this._handler = handler;
        this._node = node;
        this._strict = strict;
    }
    get node() {
        return this._node;
    }
    get strict() {
        return this._strict;
    }
    get handler() {
        return this._handler;
    }
    update(state: TRoot, change: IUndo<TRoot, any>) {
        if (change.in(this._node, this._strict)) {
            this._handler(state, change);
        }
    }
    unSubscribe() {
        this.updateHandler.unSubscribe(this);
    }
}
