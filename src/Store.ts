import { Instructor } from "./Instructor";
import {
    ExtractNodeValue,
    Handler,
    IAccessorContainer,
    IInstruction,
    IInstructor,
    INode,
    INodeSubscriber,
    IStore,
    ITransformer,
    IUndo,
    IUpdateHandler,
    NodeValue,
    PathNode,
    StoreHandler,
    Transformator
} from "./interfaces";
import { isCountainer } from "./Node";
import { NodeSubscriber } from "./NodeSubscriber";
import { Transformer } from "./Transformer";
import { UpdateHandler } from "./UpdateHandler";

export class Store<TRoot extends object | any[] | Map<any, any>>
    implements IStore<TRoot> {
    instructor: IInstructor<TRoot>;
    updateHandler: IUpdateHandler<TRoot>;
    private updateList!: Array<IUndo<TRoot, any>>;
    private transformer: ITransformer<TRoot, any>;
    private batchTransformer: ITransformer<TRoot, any>;
    private stateStore: TRoot;
    private _isUpdating: boolean;
    private transformator?: Transformator<TRoot, TRoot>;
    constructor(
        initState?: TRoot,
        transformator?: Transformator<TRoot, TRoot>
    ) {
        this._isUpdating = false;
        this.stateStore = initState || {} as any;
        this.transformator = transformator;
        this.transformer = new Transformer(this, this.applyChange);
        this.batchTransformer = new Transformer(this, this.transform);
        this.instructor = new Instructor(this);
        this.updateHandler = new UpdateHandler();
    }
    get state() {
        return this.stateStore;
    }
    set state(value: TRoot) {
        this.stateStore = value;
    }
    get = <TNode extends INode<TRoot, any, any, any, any>>(
        node: IAccessorContainer<TRoot, TNode>
    ): ExtractNodeValue<TNode> => {
        if (isCountainer<TNode>(node)) {
            return node[PathNode].get(this.stateStore);
        } else {
            return node.get(this.stateStore);
        }
    }
    set = <TValue, TNode extends INode<TRoot, any, TValue, any, any>>(
        node: IAccessorContainer<TRoot, TNode>,
        value: NodeValue<TValue>
    ) => {
        this.instructor.set(node, value);
    }
    add = <TValue, TNode extends INode<TRoot, any, TValue, any, any>>(
        node: IAccessorContainer<TRoot, TNode>,
        value: NodeValue<TValue>
    ) => {
        this.instructor.add(node, value);
    }
    remove = <TValue, TNode extends INode<TRoot, any, TValue, any, any>>(
        node: IAccessorContainer<TRoot, TNode>
    ) => {
        this.instructor.remove(node);
    }
    batch = (batch: (instructor: IInstructor<TRoot>) => void) => {
        if (this.isUpdating()) {
            return;
        }
        this._isUpdating = true;
        this.updateList = [];
        batch(this.batchTransformer);
        this.updateHandler.update(this.stateStore, this.updateList);
        this._isUpdating = false;
    }
    update(instructions: IInstruction<TRoot, any>) {
        if (this.isUpdating()) {
            return;
        }
        this._isUpdating = true;
        this.updateList = [];
        this.transform(instructions);
        this.updateHandler.update(this.stateStore, this.updateList);
        this._isUpdating = false;
    }
    subscribe(
        handler: Handler<TRoot> | StoreHandler<TRoot>,
        node?: IAccessorContainer<TRoot, INode<TRoot, any, any, any, any>>,
        strict?: boolean
    ) {
        const sub = this.updateHandler.subscribe(handler as any, node as any, strict);
        if (sub instanceof NodeSubscriber) {
            return sub as INodeSubscriber<TRoot> as any;
        }
        return this;
    }
    unSubscribe(handler: StoreHandler<TRoot>) {
        this.updateHandler.unSubscribe(handler);
        return this;
    }
    private isUpdating() {
        if (this._isUpdating) {
            console.group("Reistore: Store");
            console.error("Trying to run update before last update finished, asynchronous problem?");
            console.error("store: ", this);
            console.groupEnd();
        }
        return this._isUpdating;
    }
    private transform(change: IInstruction<TRoot, any>) {
        if (this.transformator) {
            this.transformator(change, this.transformer);
            return;
        }
        this.applyChange(change);
    }
    private applyChange = (change: IInstruction<TRoot, any>) => {
        const { node, value } = change;
        this.addChange(node.set(this.state, value));
    }
    private addChange(change: IUndo<TRoot, any>) {
        this.updateList.push(change);
    }
}

export function createStore<TState extends object | any[] | Map<any, any>>(
    initState?: TState,
    transformator?: Transformator<TState, TState>
): IStore<TState> {
    return new Store(initState, transformator);
}
