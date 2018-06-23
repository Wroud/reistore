import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexGetter, IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
export declare class Instructor<TState> implements IInstructor<TState> {
    private store;
    private transaction;
    private isTransaction;
    constructor(store: IStore<TState>);
    beginTransaction(): void;
    flush(): void;
    undoTransaction(): void;
    set<TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): void;
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): void;
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[], index: string | number | IndexSearch<TValue>): void;
    static createSet<TState, TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): {
        path: IPath<TState, TValue>;
        args: PathArg[];
        index: string | number | IndexGetter<TValue> | undefined;
        value: TValue;
        type: InstructionType;
    };
    static createAdd<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>): {
        path: IPath<TState, TValue | {
            [key: string]: TValue;
        } | {
            [key: number]: TValue;
        } | TValue[]>;
        args: PathArg[];
        index: string | number | IndexGetter<TValue> | undefined;
        value: TValue;
        type: InstructionType;
    };
    static createRemove<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[], index: string | number | IndexSearch<TValue>): {
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
