import { IScope, Transformator, ISchema, INode, IInstruction, IStore, ICountainer, PathNode } from "./interfaces";
import { Schema } from "./Schema";
import { Transformer } from "./Transformer";
import { isCountainer } from "./Node";

export class Scope<TState extends object | any[] | Map<any, any>, TParent, TScope>
    extends Schema<TState>
    implements IScope<TState, TParent, TScope> {

    private parent: ISchema<TState>;
    private _schema: ISchema<TState>;
    node: INode<TState, TParent, TScope, any, any>;

    constructor(
        parent: ISchema<TState>,
        node: INode<TState, TParent, TScope, any, any> | ICountainer<INode<TState, TParent, TScope, any, any>>,
        transformator?: Transformator<TState, TScope>
    ) {
        super(transformator);
        this.parent = parent;
        this._schema = parent.schema;
        if (isCountainer<INode<TState, TParent, TScope, any, any>>(node)) {
            this.node = node[PathNode];
        } else {
            this.node = node;
        }
        this.parent.bindSchema(this);
        this.transform = this.transform.bind(this);
    }
    get schema() {
        return this._schema;
    }
    transform(store: IStore<TState>, change: IInstruction<TState, any>) {
        if (this.transformator === undefined) {
            this.applyChange(store, change);
            return;
        }
        const transformer = new Transformer(store, this.applyChange, this.node);
        this.transformator(change, transformer);
    }
    createScope<TNewScope>(
        node: INode<TState, TScope, TNewScope, any, any> | ICountainer<INode<TState, TScope, TNewScope, any, any>>,
        transformator?: Transformator<TState, TNewScope>
    ): IScope<TState, TScope, TNewScope> {
        return new Scope(this, node, transformator);
    }
}

export function createScope<TState extends object | any[] | Map<any, any>, TModel, TScope>(
    parent: ISchema<TState>,
    node: INode<TState, TModel, TScope, any, any> | ICountainer<INode<TState, TModel, TScope, any, any>>,
    transformator?: Transformator<TState, TScope>
): IScope<TState, TModel, TScope> {
    return new Scope(parent, node, transformator);
}

export function isScope<TStore extends object | any[] | Map<any, any>, TModel, TScope>(object): object is IScope<TStore, TModel, TScope> {
    return object instanceof Scope;
}
