import { IScope, IPath, IStoreSchema, Transformator } from "./interfaces";
import { StoreSchema } from "./StoreSchema";

export class Scope<TState, TModel, TScope> extends StoreSchema<TState, TScope> implements IScope<TState, TModel, TScope> {
    parent: IStoreSchema<TState, TModel>;
    store: IStoreSchema<TState, TState>;
    path: IPath<TState, TScope>;
    constructor(parent: IStoreSchema<TState, TModel>, path: IPath<TState, TScope>, transformator?: Transformator<TState, TScope>) {
        super(transformator);
        this.parent = parent;
        this.store = isScope<TState, any, TModel>(parent) ? parent.store : (parent as any);
        this.path = path.toMutable();
        this.parent.addScope(this);
    }
    getState(state: TState) {
        return this.path.get(state, {} as TScope) as TScope;
    }
    createScope<TNewScope>(scope: IPath<TScope, TNewScope>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope> {
        return new Scope(this, this.path.join(scope), transformator);
    }
}

export function createScope<TState, TModel, TScope>(parent: IStoreSchema<TState, TModel>, path: IPath<TState, TScope>, transformator?: Transformator<TState, TScope>) {
    return new Scope(parent, path, transformator);
}

export function isScope<TStore, TModel, TScope>(object): object is IScope<TStore, TModel, TScope> {
    return "path" in object;
}
