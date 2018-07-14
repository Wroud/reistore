import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath, IInstruction } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexSearch, ValueMap, Injection } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
import { InstructionValue } from "./interfaces/IInstruction";
export declare class Instructor<TState> implements IInstructor<TState> {
    private store;
    private transaction;
    private isTransaction;
    constructor(store: IStore<TState>);
    getTransaction(): IInstruction<any, any>[];
    beginTransaction(): void;
    flush(): void;
    undoTransaction(): void;
    inject(injection: Injection<TState>): void;
    set<TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): void;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): void;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): void;
    static createInject<TState>(injection: Injection<TState>): {
        type: InstructionType;
        injection: Injection<TState>;
    };
    static createSet<TState, TValue>(path: IPath<TState, TValue>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): {
        path: IPath<TState, TValue>;
        args: PathArg[];
        value: InstructionValue<TValue>;
        type: InstructionType;
    };
    static createAdd<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: InstructionValue<TValue>, ...pathArgs: PathArg[]): {
        path: IPath<TState, TValue | {
            [key: string]: TValue;
        } | {
            [key: number]: TValue;
        } | TValue[]>;
        args: PathArg[];
        value: InstructionValue<TValue>;
        type: InstructionType;
    };
    static createRemove<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, ...pathArgs: PathArg[]): {
        path: IPath<TState, {
            [key: string]: TValue;
        } | {
            [key: number]: TValue;
        } | TValue[]>;
        args: PathArg[];
        index: string | number | IndexSearch<TValue>;
        type: InstructionType;
    };
}
