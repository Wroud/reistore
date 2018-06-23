import { IScope, IPath, IStoreSchema, Transformator, PathSelector } from "./interfaces";
import { StoreSchema } from "./StoreSchema";
import { IStore } from "./interfaces/IStore";
import { isStore } from "./tools";
import { isPath, Path } from "./Path";


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
    getState(state: TState | IStore<TState>) {
        return isStore<TState>(state)
            ? this.path.get(state.state, {} as TScope) as TScope
            : this.path.get(state, {} as TScope) as TScope;
    }
    createScope<TNewScope>(scope: IPath<TScope, TNewScope> | PathSelector<TScope, TNewScope>, transformator?: Transformator<TState, TNewScope>): IScope<TState, TScope, TNewScope> {
        const rpath = isPath<TScope, TNewScope>(scope) ? scope : Path.fromSelector(scope);
        return new Scope(this, this.path.join(rpath), transformator);
    }
}

export function createScope<TState, TModel, TScope>(parent: IStoreSchema<TState, TModel>, path: IPath<TState, TScope> | PathSelector<TState, TScope>, transformator?: Transformator<TState, TScope>) {
    const rpath = isPath<TState, TScope>(path) ? path : Path.fromSelector(path);
    return new Scope(parent, rpath, transformator);
}

export function isScope<TStore, TModel, TScope>(object): object is IScope<TStore, TModel, TScope> {
    return "path" in object;
}
