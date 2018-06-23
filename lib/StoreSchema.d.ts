import { IInstruction, IPath, IStoreSchema, Transformator, IScope } from "./interfaces";
import { PathArg } from "interfaces/IPath";
export declare class StoreSchema<TState, T> implements IStoreSchema<TState, T> {
    transformator: Transformator<TState, T>;
    private scopes;
    constructor(transformator?: Transformator<TState, T>);
    getState(state: TState): any;
    transform(state: TState, instructions: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
    addScope(scope: IScope<TState, T, any>): void;
    removeScope(scope: IScope<TState, T, any>): void;
    protected isInstruction: (instruction: IInstruction<TState, any>) => (path: IPath<TState, any>, args?: PathArg[] | undefined, strict?: boolean | undefined) => boolean;
}
export declare function createSchema<TState, T>(transformator?: Transformator<TState, T>): StoreSchema<TState, T>;
