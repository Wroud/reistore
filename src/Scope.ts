import { IScope, IPath, Transformator, PathSelector, ISchema, IStore } from "./interfaces";
import { isStore } from "./tools";
import { isPath, Path } from "./Path";
import { Schema } from "./Schema";

export class Scope<TState, TParent, TScope>
    extends Schema<TState, TScope>
    implements IScope<TState, TParent, TScope> {

    parent: ISchema<TState, TParent>;
    schema: ISchema<TState, TState>;
    path: IPath<TState, TScope>;

    constructor(
        parent: ISchema<TState, TParent>,
        path: IPath<TState, TScope>,
        initState?: TScope,
        transformator?: Transformator<TState, TScope>,
        mutateParent: boolean = true
    ) {
        super(initState, transformator);
        this.parent = parent;
        this.schema = isScope<TState, any, any>(parent)
            ? parent.schema
            : parent as any as ISchema<TState, TState>;
        this.path = mutateParent ? path.toMutable() : path;
        this.parent.bindSchema(this);
    }
    setInitState(store: IStore<TState>) {
        store.instructor.set(this.path, v => v === undefined ? this.initState : v);
        for (const scope of this.scopes) {
            scope.setInitState(store);
        }
    }
    getState(state: TState | IStore<TState>) {
        return isStore<TState>(state)
            ? this.path.get(state.state, this.initState) as TScope
            : this.path.get(state, this.initState) as TScope;
    }
    joinPath<TValue>(path: IPath<TScope, TValue> | PathSelector<TScope, TValue>) {
        return this.path.join(path);
    }
    createScope<TNewScope>(
        scope: IPath<TScope, TNewScope> | PathSelector<TScope, TNewScope>,
        initState?: TNewScope,
        transformator?: Transformator<TState, TNewScope>,
        mutateParent?: boolean
    ): IScope<TState, TScope, TNewScope> {
        return new Scope(this, this.path.join(scope), initState, transformator, mutateParent);
    }
}

export function createScope<TState, TModel, TScope>(
    parent: ISchema<TState, TModel>,
    path: IPath<TState, TScope> | PathSelector<TState, TScope>,
    initState?: TScope,
    transformator?: Transformator<TState, TScope>,
    mutateParent?: boolean
) {
    const rpath = isPath<TState, TScope>(path) ? path : Path.create(path);
    return new Scope(parent, rpath, initState, transformator, mutateParent);
}

export function isScope<TStore, TModel, TScope>(object): object is IScope<TStore, TModel, TScope> {
    return "path" in object && "parent" in object;
}
