import { ISchema, Transformator, IInstruction, IUpdateHandler, Handler, INode, NodeValue, IStore, IInstructor, IUndo, ExtractNodeValue, IAccessorContainer } from "./interfaces";
export declare class Store<TState extends object | any[] | Map<any, any>> implements IStore<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState>;
    private updateList;
    private transformer;
    private stateStore;
    private _isUpdating;
    constructor(initState?: TState, schema?: ISchema<TState>, transformator?: Transformator<TState, TState>);
    state: TState;
    get<TNode extends INode<TState, any, any, any, any>>(node: IAccessorContainer<TState, TNode>): ExtractNodeValue<TNode>;
    set<TValue, TNode extends INode<TState, any, TValue, any, any>>(node: IAccessorContainer<TState, TNode>, value: NodeValue<TValue>): void;
    add<TValue, TNode extends INode<TState, any, TValue, any, any>>(node: IAccessorContainer<TState, TNode>, value: NodeValue<TValue>): void;
    remove<TValue, TNode extends INode<TState, any, TValue, any, any>>(node: IAccessorContainer<TState, TNode>): void;
    batch(batch: (instructor: IInstructor<TState>) => void): void;
    update(instructions: IInstruction<TState, any>): void;
    addChange(change: IUndo<TState, any>): void;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
    private isUpdating;
}
export declare function createStore<TState extends object | any[] | Map<any, any>>(initState?: TState, schema?: ISchema<TState>, transformator?: Transformator<TState, TState>): Store<TState>;
