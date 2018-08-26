import { INode, NodeValue, INodeAccessor, ICountainer } from "./INode";
import { IInstruction } from "./IInstruction";
export interface IInstructor<TState> {
    state: TState;
    add<TValue>(node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): any;
    set<TValue>(node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): any;
    remove(node: INodeAccessor<TState, INode<TState, any, any, any, any>> | ICountainer<INode<TState, any, any, any, any>>): any;
}
export interface ITransformer<TState, TScope> extends IInstructor<TState> {
    scope?: TScope;
    apply(instruction: IInstruction<TState, any>): any;
}
