import { Instructor } from "./Instructor";
import { UpdateHandler } from "./UpdateHandler";
import {
    ISchema,
    Transformator,
    IInstruction,
    IUpdateHandler,
    Handler,
    INode,
    NodeValue,
    IStore,
    IInstructor,
    ITransformer,
    IUndo,
    PathNode,
    ExtractNodeValue,
    IAccessorContainer,
    StoreHandler,
    INodeSubscriber
} from "./interfaces";
import { Schema } from "./Schema";
import { Transformer } from "./Transformer";
import { isCountainer } from "./Node";
import { NodeSubscriber } from "./NodeSubscriber";

export class Store<TRoot extends object | any[] | Map<any, any>>
    implements IStore<TRoot> {
    instructor: IInstructor<TRoot>;
    updateHandler: IUpdateHandler<TRoot>;
    schema: ISchema<TRoot>;
    private updateList!: IUndo<TRoot, any>[];
    private transformer: ITransformer<TRoot, any>;
    private stateStore: TRoot;
    private _isUpdating: boolean;
    constructor(
        initState?: TRoot,
        schema?: ISchema<TRoot>,
        transformator?: Transformator<TRoot, TRoot>
    ) {
        this._isUpdating = false;
        this.stateStore = initState || {} as any;
        this.schema = schema || new Schema(transformator);
        this.transformer = new Transformer(this, this.schema.transform);
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
        batch(this.transformer);
        this.updateHandler.update(this.stateStore, this.updateList);
        this._isUpdating = false;
    }
    update(instructions: IInstruction<TRoot, any>) {
        if (this.isUpdating()) {
            return;
        }
        this._isUpdating = true;
        this.updateList = [];
        this.schema.transform(this, instructions);
        this.updateHandler.update(this.stateStore, this.updateList);
        this._isUpdating = false;
    }
    addChange(change: IUndo<TRoot, any>) {
        this.updateList.push(change);
    }
    subscribe(
        handler: Handler<TRoot> | StoreHandler<TRoot>,
        node?: IAccessorContainer<TRoot, INode<TRoot, any, any, any, any>>,
        strict?: boolean
    ) {
        var sub = this.updateHandler.subscribe(handler as any, node as any, strict);
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
            console.group("Reistate:Store");
            console.error("Trying to run update before last update finished, asynchronous problem?");
            console.error("store: ", this);
            console.groupEnd();
        }
        return this._isUpdating;
    }
}

export function createStore<TState extends object | any[] | Map<any, any>>(
    initState?: TState,
    schema?: ISchema<TState>,
    transformator?: Transformator<TState, TState>
): IStore<TState> {
    return new Store(initState, schema, transformator);
}
