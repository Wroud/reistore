import { IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexSearch, ValueMap, Injection, Batch, IInject, IBatch } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
import { InstructionValue } from "./interfaces/IInstruction";
import { Instruction } from "./Instruction";
export declare type InstructorBashInject<TState> = IInject<TState> & IBatch<TState>;
export declare class Instructor<TState> implements InstructorBashInject<TState> {
    private store;
    private batchInstructions;
    private isBatch;
    constructor(store: IStore<TState>);
    batch(batch: Batch<TState>): void;
    inject(injection: Injection<TState>): void;
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): void;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): void;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): void;
    private beginTransaction;
    private flush;
    static createInject<TState>(injection: Injection<TState>): Instruction<TState, undefined>;
    static createSet<TState, TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, pathArgs: PathArg[]): Instruction<TState, TValue>;
    static createAdd<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, pathArgs: PathArg[]): Instruction<TState, TValue>;
    static createRemove<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, pathArgs: PathArg[]): Instruction<TState, TValue>;
}
