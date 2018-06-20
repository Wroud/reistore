import { IScope, IInstruction, IPath, IStore, Transformator } from "./interfaces";
import { Store } from "./Store";

export class Scope<TState, TModel, TScope> extends Store<TState, TScope> implements IScope<TState, TModel, TScope> {
    parent: IStore<TState, TModel>;
    store: IStore<TState, TState>;
    path: IPath<TState, TScope>;
    constructor(parent: IStore<TState, TModel>, path: IPath<TState, TScope>, transformator?: Transformator<TState, TScope>) {
        super(undefined, transformator);;
        this.parent = parent;
        this.store = isScope<TState, any, TModel>(parent) ? parent.store : (parent as any);
        this.path = path;
        this.parent.addScope(this);
    }
    get state() {
        return this.path.get(this.store.state, {} as TScope) as TScope;
    }
    createScope<TNewScope>(scope: IPath<TScope, TNewScope>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope> {
        return new Scope(this, this.path.join(scope), transformator);
    }
    update(instructions: IterableIterator<IInstruction<TState, any>>) {
        this.store.update(instructions);
    }
}

export function isScope<TStore, TModel, TScope>(object): object is IScope<TStore, TModel, TScope> {
    return "path" in object;
}
