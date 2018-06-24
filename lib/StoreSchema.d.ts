import { Transformator } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { Schema } from "./Schema";
export declare class StoreSchema<TState> extends Schema<TState, TState> {
    setInitState(store: IStore<TState>): void;
    getState(state: TState | IStore<TState>): any;
}
export declare function createSchema<TState>(initState?: TState, transformator?: Transformator<TState, TState>): StoreSchema<TState>;
