import { IInstruction, IPath, Transformator, ISchema, IStore, PathArg } from "./interfaces";
export declare abstract class Schema<TState, T> implements ISchema<TState, T> {
    transformator: Transformator<TState, T>;
    protected scopes: ISchema<TState, any>[];
    protected initState: T;
    constructor(initState?: T, transformator?: Transformator<TState, T>);
    abstract setInitState(store: IStore<TState>): any;
    abstract getState(state: TState | IStore<TState>): any;
    transform(state: TState, instructions: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
    bindSchema(schema: ISchema<TState, any>): void;
    unBindSchema(schema: ISchema<TState, any>): void;
    protected isInstruction: (instruction: IInstruction<TState, any>) => (path: IPath<TState, any>, args?: PathArg[] | undefined, strict?: boolean | undefined) => boolean;
}