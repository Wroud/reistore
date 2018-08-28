import { INodeSubscriber, IUndo, INodeAccessor, IUpdateHandler, INode, INodeUpdateHandler } from "./interfaces";

export class NodeUpdateHandler<TRoot> implements INodeUpdateHandler<TRoot> {
    node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>;
    private strictHandlers: Array<INodeSubscriber<TRoot>>;
    private handlers: INodeSubscriber<TRoot>[];
    private updateHandler: IUpdateHandler<TRoot>;
    constructor(
        updateHandler: IUpdateHandler<TRoot>,
        node: INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>
    ) {
        this.updateHandler = updateHandler;
        this.node = node;
        this.strictHandlers = [];
        this.handlers = [];
    }
    update(state: TRoot, change: IUndo<TRoot, any>, fromChildren: boolean) {
        if (!fromChildren) {
            for (const handler of this.strictHandlers) {
                handler.update(state, change);
            }
        }
        for (const handler of this.handlers) {
            handler.update(state, change);
        }
        let parent = this.node.node.parent;
        while (parent !== undefined) {
            let next = this.updateHandler.getNodeHandler(parent);
            if (next !== undefined) {
                next.update(state, change, true);
                break;
            }
            parent = parent.parent;
        }
    }
    subscribe(subscriber: INodeSubscriber<TRoot>) {
        if (subscriber.strict) {
            this.strictHandlers.push(subscriber);
        } else {
            this.handlers.push(subscriber);
        }
        return this;
    }
    unSubscribe(handler: INodeSubscriber<TRoot>) {
        var source = handler.strict ? this.strictHandlers : this.handlers;
        const id = source.indexOf(handler);
        if (id > -1) {
            source.splice(id, 1);
        }
        return this;
    }
}
