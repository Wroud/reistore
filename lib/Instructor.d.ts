import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg, PathValue } from "./interfaces/IPath";
export declare class Instructor<TState> implements IInstructor<TState> {
    private store;
    private transaction;
    private isTransaction;
    constructor(store: IStore<TState>);
    beginTransaction(): void;
    flush(): void;
    undoTransaction(): void;
    set<TValue>(path: IPath<TState, TValue>, value: PathValue<TValue>, pathArgs?: PathArg[]): void;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: PathValue<TValue>, pathArgs?: PathArg[]): void;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, pathArgs?: PathArg[]): void;
    static createSet<TState, TValue>(path: IPath<TState, TValue>, value: PathValue<TValue>, pathArgs?: PathArg[]): {
        path: IPath<TState, TValue>;
        args: PathArg[] | undefined;
        value: PathValue<TValue>;
        type: InstructionType;
    };
    static createAdd<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: PathValue<TValue>, pathArgs?: PathArg[]): {
        path: IPath<TState, TValue | {
            [key: string]: TValue;
        } | {
            [key: number]: TValue;
        } | TValue[]>;
        args: PathArg[] | undefined;
        value: PathValue<TValue>;
        type: InstructionType;
    };
    static createRemove<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, index: string | number | IndexSearch<TValue>, pathArgs?: PathArg[]): {
        path: IPath<TState, {
            [key: string]: TValue;
        } | {
            [key: number]: TValue;
        } | TValue[]>;
        args: PathArg[] | undefined;
        index: string | number | IndexSearch<TValue>;
        type: InstructionType;
    };
}
