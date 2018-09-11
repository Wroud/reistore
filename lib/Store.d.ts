import { ISchema, Transformator, IInstruction, IUpdateHandler, Handler, INode, NodeValue, IStore, IInstructor, IUndo, ExtractNodeValue, IAccessorContainer, StoreHandler } from "./interfaces";
export declare class Store<TRoot extends object | any[] | Map<any, any>> implements IStore<TRoot> {
    instructor: IInstructor<TRoot>;
    updateHandler: IUpdateHandler<TRoot>;
    schema: ISchema<TRoot>;
    private updateList;
    private transformer;
    private stateStore;
    private _isUpdating;
    constructor(initState?: TRoot, schema?: ISchema<TRoot>, transformator?: Transformator<TRoot, TRoot>);
    state: TRoot;
    get: <TNode extends INode<TRoot, any, any, any, any>>(node: IAccessorContainer<TRoot, TNode>) => ExtractNodeValue<TNode>;
    set: <TValue, TNode extends INode<TRoot, any, TValue, any, any>>(node: IAccessorContainer<TRoot, TNode>, value: NodeValue<TValue>) => void;
    add: <TValue, TNode extends INode<TRoot, any, TValue, any, any>>(node: IAccessorContainer<TRoot, TNode>, value: NodeValue<TValue>) => void;
    remove: <TValue, TNode extends INode<TRoot, any, TValue, any, any>>(node: IAccessorContainer<TRoot, TNode>) => void;
    batch: (batch: (instructor: IInstructor<TRoot>) => void) => void;
    update(instructions: IInstruction<TRoot, any>): void;
    addChange(change: IUndo<TRoot, any>): void;
    subscribe(handler: Handler<TRoot> | StoreHandler<TRoot>, node?: IAccessorContainer<TRoot, INode<TRoot, any, any, any, any>>, strict?: boolean): any;
    unSubscribe(handler: StoreHandler<TRoot>): this;
    private isUpdating;
}
export declare function createStore<TState extends object | any[] | Map<any, any>>(initState?: TState, schema?: ISchema<TState>, transformator?: Transformator<TState, TState>): IStore<TState>;
