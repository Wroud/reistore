import { IInstruction, IUpdateHandler, IPath, Handler } from "./interfaces";
import { IStoreInstructor } from "./interfaces/IStore";
import { IndexSearch, ValueMap, Batch, IBatch } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
import { ISchema, Transformator } from "./interfaces/ISchema";
import { InstructionValue } from "./interfaces/IInstruction";
export declare class Store<TState> implements IStoreInstructor<TState> {
    instructor: IBatch<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState, TState>;
    private stateStore;
    private updateList;
    private isUpdating;
    private isImmutable;
    private isInjecting;
    constructor(schema?: ISchema<TState, TState>, initState?: TState, transformator?: Transformator<TState, TState>, isImmutable?: boolean);
    state: TState;
    batch(batch: Batch<TState>): void;
    get<TValue>(path: IPath<TState, TValue> | ISchema<TState, TValue>, ...pathArgs: PathArg[]): TValue | undefined;
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): void;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): void;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): void;
    update(instructions: IterableIterator<IInstruction<TState, any>>): void;
    private transformState;
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
export declare function createStore<TState>(schema?: ISchema<TState, TState>, initState?: TState, transformator?: Transformator<TState, TState>, isImmutable?: boolean): Store<TState>;
