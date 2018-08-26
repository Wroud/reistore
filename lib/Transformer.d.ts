import { ITransformer, INodeAccessor, NodeValue, INode, ApplyChange, IInstruction, IStore, ICountainer } from "./interfaces";
export declare class Transformer<TState extends object | any[] | Map<any, any>, TScope> implements ITransformer<TState, TScope> {
    private node?;
    private store;
    private applyChange;
    constructor(store: IStore<TState>, applyChange: ApplyChange<TState>, node?: INode<TState, any, TScope, any, any>);
    readonly scope: TScope | undefined;
    readonly state: TState;
    apply(instruction: IInstruction<TState, any>): void;
    set<TValue>(node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): void;
    add<TValue>(node: INodeAccessor<TState, INode<TState, any, TValue, any, any>> | ICountainer<INode<TState, any, TValue, any, any>>, value: NodeValue<TValue>): void;
    remove(node: INodeAccessor<TState, INode<TState, any, any, any, any>> | ICountainer<INode<TState, any, any, any, any>>): void;
}
