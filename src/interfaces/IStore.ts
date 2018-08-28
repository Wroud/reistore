import { IUpdateHandler, Handler, StoreHandler } from "./IUpdateHandler";
import { IInstructor } from "./IInstructor";
import { IInstruction } from "./IInstruction";
import { INode, ExtractNodeValue, IUndo, IAccessorContainer } from "./INode";
import { ISchema } from "./ISchema";
import { INodeSubscriber } from "./INodeSubscriber";

export interface IStore<TRoot extends object | any[] | Map<any, any>>
    extends IInstructor<TRoot> {
    state: TRoot;
    instructor: IInstructor<TRoot>;
    updateHandler: IUpdateHandler<TRoot>;
    schema: ISchema<TRoot>;
    get<TNode extends INode<TRoot, any, any, any, any>>(
        node: IAccessorContainer<TRoot, TNode>
    ): ExtractNodeValue<TNode>;
    update(instruction: IInstruction<TRoot, any>);
    batch(batch: (instructor: IInstructor<TRoot>) => void);
    addChange(change: IUndo<TRoot, any>);
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
