import { IPath, PathArg } from "./IPath";
import { InstructionValue } from "./IInstruction";

export type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export type IndexGetter<TValue> = (value: TValue[]) => string | number;
export type ValueMap<TValue> = { [key: string]: TValue } | { [key: number]: TValue };
export type Injection<TState> = (state: TState, instructor: IInstructor<TState>) => any;

export interface IInstructor<TState> {
    getTransaction();
    beginTransaction();
    flush();
    undoTransaction();
    inject(injection: Injection<TState>);
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]);
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]);
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]);
}
