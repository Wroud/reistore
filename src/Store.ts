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
    IAccessorContainer
} from "./interfaces";
import { Schema } from "./Schema";
import { Transformer } from "./Transformer";
import { isCountainer } from "./Node";

export class Store<TState extends object | any[] | Map<any, any>>
    implements IStore<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState>;
    private updateList!: IUndo<TState, any>[];
    private transformer: ITransformer<TState, any>;
    private stateStore: TState;
    private _isUpdating: boolean;
    constructor(
        initState?: TState,
        schema?: ISchema<TState>,
        transformator?: Transformator<TState, TState>
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
    set state(value: TState) {
        this.stateStore = value;
    }
    get<TNode extends INode<TState, any, any, any, any>>(
        node: IAccessorContainer<TState, TNode>
    ): ExtractNodeValue<TNode> {
        if (isCountainer<TNode>(node)) {
            return node[PathNode].get(this.stateStore);
        } else {
            return node.get(this.stateStore);
        }
    }
    set<TValue, TNode extends INode<TState, any, TValue, any, any>>(
        node: IAccessorContainer<TState, TNode>,
        value: NodeValue<TValue>
    ) {
        this.instructor.set(node, value);
    }
    add<TValue, TNode extends INode<TState, any, TValue, any, any>>(
        node: IAccessorContainer<TState, TNode>,
        value: NodeValue<TValue>
    ) {
        this.instructor.add(node, value);
    }
    remove<TValue, TNode extends INode<TState, any, TValue, any, any>>(
        node: IAccessorContainer<TState, TNode>
    ) {
        this.instructor.remove(node);
    }
    batch(batch: (instructor: IInstructor<TState>) => void) {
        if (this.isUpdating()) {
            return;
        }
        this._isUpdating = true;
        this.updateList = [];
        batch(this.transformer);
        this.updateHandler.update(this.stateStore, this.updateList);
        this._isUpdating = false;
    }
    update(instructions: IInstruction<TState, any>) {
        if (this.isUpdating()) {
            return;
        }
        this._isUpdating = true;
        this.updateList = [];
        this.schema.transform(this, instructions);
        this.updateHandler.update(this.stateStore, this.updateList);
        this._isUpdating = false;
    }
    addChange(change: IUndo<TState, any>) {
        this.updateList.push(change);
    }
    subscribe(handler: Handler<TState>) {
        this.updateHandler.subscribe(handler);
        return this;
    }
    unSubscribe(handler: Handler<TState>) {
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
) {
    return new Store(initState, schema, transformator);
}
