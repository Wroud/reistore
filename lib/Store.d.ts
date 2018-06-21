import { IInstruction, IInstructor, IStoreSchema, IUpdateHandler } from "./interfaces";
import { IStore } from "./interfaces/IStore";
export declare class Store<TState> implements IStore<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler;
    private schema;
    private stateStore;
    constructor(schema: IStoreSchema<TState, TState>, initState?: TState);
    readonly state: TState;
    update(instructions: IterableIterator<IInstruction<TState, any>>): void;
}
