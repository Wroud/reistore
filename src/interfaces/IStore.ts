import { IInstruction } from "./IInstruction";
import { IInstructor } from "./IInstructor";
import { ExtractNodeValue, IAccessorContainer, INode } from "./INode";
import { INodeSubscriber } from "./INodeSubscriber";
import { Handler, IUpdateHandler, StoreHandler } from "./IUpdateHandler";

export interface IStore<TRoot>
    extends IInstructor<TRoot> {
    state: TRoot;
    instructor: IInstructor<TRoot>;
    updateHandler: IUpdateHandler<TRoot>;
    get<TNode extends INode<TRoot, any, any, any, any>>(
        node: IAccessorContainer<TRoot, TNode>
    ): ExtractNodeValue<TNode>;
    update(instruction: IInstruction<TRoot, any>);
    batch(batch: (instructor: IInstructor<TRoot>) => void);
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
