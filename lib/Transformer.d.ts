import { ITransformer, IPath, InstructionValue, PathArg, ValueMap, IndexSearch } from "./interfaces";
export declare class Transformer<TState, TScope> implements ITransformer<TState, TScope> {
    scope: () => TScope;
    state: TState;
    constructor(scope: () => TScope, state: TState);
    set<TState, TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): import("Instruction").Instruction<TState, TValue>;
    add<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): import("Instruction").Instruction<TState, TValue>;
    remove<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): import("Instruction").Instruction<TState, TValue>;
}
