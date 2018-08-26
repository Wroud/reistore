import { IStore, INode, INodeAccessor, NodeValue, IInstructor, ICountainer } from "./interfaces";
export declare class Instructor<TState extends object | any[] | Map<any, any>> implements IInstructor<TState> {
    private store;
    constructor(store: IStore<TState>);
    readonly state: TState;
    set<TValue>(node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): void;
    add<TValue>(node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): void;
    remove(node: INodeAccessor<TState, INode<TState, any, any, any, any>> | ICountainer<INode<TState, any, any, any, any>>): void;
}
