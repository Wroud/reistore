import { Transformator, IStore } from "./interfaces";
import { isStore } from "./tools";
import { Schema } from "./Schema";

export class StoreSchema<TState> extends Schema<TState, TState> {
    setInitState(store: IStore<TState>) {
        if (!store.state) {
            store.state = { ...this.initState as any };
        }
        for (const scope of this.scopes) {
            scope.setInitState(store);
        }
    }
    getState(state: TState | IStore<TState>) {
        return isStore(state) ? state.state : state as any;
    }
}

export function createSchema<TState>(initState?: TState, transformator?: Transformator<TState, TState>) {
    return new StoreSchema(initState, transformator);
}
