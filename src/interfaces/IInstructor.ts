import { IPath, PathArg } from "./IPath";
import { InstructionValue } from "./IInstruction";

export type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export type IndexGetter<TValue> = (value: TValue[]) => string | number;
export type ValueMap<TValue> = { [key: string]: TValue } | { [key: number]: TValue };
export type Injection<TState> = (state: TState, instructor: IBatch<TState>) => any;
export type Batch<TState> = (store: IInject<TState>) => void;

export interface IBatch<TState> extends IInstructor<TState> {
    batch(batch: Batch<TState>);
}

export interface IInject<TState> extends IInstructor<TState> {
    inject(injection: Injection<TState>);
}

export interface IInstructor<TState> {
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]);
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]);
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]);
}
