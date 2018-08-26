import { IUpdateHandler, Handler } from "./IUpdateHandler";
import { IInstructor } from "./IInstructor";
import { IInstruction } from "./IInstruction";
import { INode, INodeAccessor, ExtractNodeValue, IUndo, ICountainer } from "./INode";
import { ISchema } from "./ISchema";

export interface IStore<TState extends object | any[] | Map<any, any>>
    extends IInstructor<TState> {
    state: TState;
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState>;
    get<TNode extends INode<TState, any, any, any, any>>(
        node: INodeAccessor<TState, TNode> | ICountainer<TNode>
    ): ExtractNodeValue<TNode>;
    update(instruction: IInstruction<TState, any>);
    batch(batch: (instructor: IInstructor<TState>) => void);
    addChange(change: IUndo<TState, any>);
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
