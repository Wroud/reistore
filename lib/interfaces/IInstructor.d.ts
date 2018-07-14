import { IPath, PathArg } from "./IPath";
import { InstructionValue } from "./IInstruction";
export declare type IndexSearch<TValue> = (value: TValue, index: string | number) => boolean;
export declare type IndexGetter<TValue> = (value: TValue[]) => string | number;
export declare type ValueMap<TValue> = {
    [key: string]: TValue;
} | {
    [key: number]: TValue;
};
export declare type Injection<TState> = (state: TState, instructor: IInstructor<TState>) => any;
export interface IInstructor<TState> {
    getTransaction(): any;
    beginTransaction(): any;
    flush(): any;
    undoTransaction(): any;
    inject(injection: Injection<TState>): any;
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): any;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): any;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): any;
}
