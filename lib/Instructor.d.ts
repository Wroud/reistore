import { IStore, INode, NodeValue, IInstructor, IAccessorContainer } from "./interfaces";
export declare class Instructor<TState extends object | any[] | Map<any, any>> implements IInstructor<TState> {
    private store;
    constructor(store: IStore<TState>);
    readonly state: TState;
    set<TValue>(node: IAccessorContainer<TState, INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): void;
    add<TValue>(node: IAccessorContainer<TState, INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): void;
    remove(node: IAccessorContainer<TState, INode<TState, any, any, any, any>>): void;
}
