import { IPath, PathArg } from "./IPath";
import { ValueMap, IndexSearch } from "./IInstructor";
import { InstructionValue, IInstruction } from "./IInstruction";
export interface ITransformer<TState, TScope> {
    scope: () => TScope;
    state: TState;
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): IInstruction<TState, TValue>;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): IInstruction<TState, TValue>;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): IInstruction<TState, TValue>;
}
