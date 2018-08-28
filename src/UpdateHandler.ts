import { IUpdateHandler, Handler, IUndo, INodeUpdateHandler, INode, IAccessorContainer, INodeAccessor, PathNode, StoreHandler } from "./interfaces";
import { isCountainer } from "./Node";
import { NodeSubscriber } from "./NodeSubscriber";
import { NodeUpdateHandler } from "./NodeUpdateHandler";

export class UpdateHandler<TRoot> implements IUpdateHandler<TRoot> {
    private handlers: Array<StoreHandler<TRoot>>;
    private nodeHandler: Map<INode<TRoot, any, any, any, any>, INodeUpdateHandler<TRoot>>;
    constructor() {
        this.handlers = [];
        this.nodeHandler = new Map();
    }
    update(state: TRoot, changes: IUndo<TRoot, any>[]) {
        for (const handler of this.handlers) {
            handler(state, changes);
        }
        for (const change of changes) {
            const handler = this.nodeHandler.get(change.node);
            if (handler !== undefined) {
                handler.update(state, change, false);
            } else {
                let parent = change.node.parent;
                while (parent !== undefined) {
                    const handler = this.nodeHandler.get(parent);
                    if (handler !== undefined) {
                        handler.update(state, change, true);
                        break;
                    }
                    parent = parent.parent;
                }
            }
        }
    }
    getNodeHandler(node: INode<TRoot, any, any, any, any>) {
        return this.nodeHandler.get(node);
    }
    subscribe(
        handler: Handler<TRoot> | StoreHandler<TRoot>,
        node?: IAccessorContainer<TRoot, INode<TRoot, any, any, any, any>>,
        strict?: boolean
    ) {
        if (node !== undefined) {
            let accessor = node as INodeAccessor<TRoot, INode<TRoot, any, any, any, any>>;
            if (isCountainer<INode<TRoot, any, any, any, any>>(node)) {
                accessor = node[PathNode];
            }
            let subscriber = this.nodeHandler.get(accessor.node);
            if (subscriber === undefined) {
                subscriber = new NodeUpdateHandler(this, accessor.node);
                this.nodeHandler.set(accessor.node, subscriber);
            }
            const subscription = new NodeSubscriber(
                subscriber,
                handler as Handler<TRoot>,
                accessor,
                strict || false
            );
            subscriber.subscribe(subscription);
            return subscription;
        } else {
            this.handlers.push(handler as StoreHandler<TRoot>);
        }
        return this;
    }
    unSubscribe(handler: StoreHandler<TRoot>) {
        const id = this.handlers.indexOf(handler);
        if (id > -1) {
            this.handlers.splice(id, 1);
        }
        return this;
    }
}
