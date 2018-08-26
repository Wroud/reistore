import { INode, NodeValue, INodeAccessor, ICountainer } from "./INode";
import { IInstruction } from "./IInstruction";

export interface IInstructor<TState> {
    state: TState;
    add<TValue>(
        node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    );
    set<TValue>(
        node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>,
        value: NodeValue<TValue>
    );
    remove(
        node: INodeAccessor<TState, INode<TState, any, any, any, any>> | ICountainer<INode<TState, any, any, any, any>>
    );
}
export interface ITransformer<TState, TScope> extends IInstructor<TState> {
    scope?: TScope;
    apply(instruction: IInstruction<TState, any>);
}
