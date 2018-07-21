import { IPath, PathArg } from "./IPath";
import { InstructionValue } from "./IInstruction";
export declare type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export declare type IndexGetter<TValue> = (value: TValue[]) => string | number;
export declare type ValueMap<TValue> = {
    [key: string]: TValue;
} | {
    [key: number]: TValue;
};
export declare type Injection<TState> = (state: TState, instructor: IBatch<TState>) => any;
export declare type Batch<TState> = (store: IInject<TState>) => void;
export interface IBatch<TState> extends IInstructor<TState> {
    batch(batch: Batch<TState>): any;
}
export interface IInject<TState> extends IInstructor<TState> {
    inject(injection: Injection<TState>): any;
}
export interface IInstructor<TState> {
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): any;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): any;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): any;
}
