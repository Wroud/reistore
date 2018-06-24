import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath, IInstruction } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg, PathValue } from "./interfaces/IPath";

export class Instructor<TState> implements IInstructor<TState> {
    private store: IStore<TState>;
    private transaction!: IInstruction<any, any>[];
    private isTransaction!: boolean;
    constructor(store: IStore<TState>) {
        this.store = store;
    }
    beginTransaction() {
        if (this.isTransaction) {
            console.group("Reistate:Instructor");
            console.error("In same time you can begin only one transaction");
            console.error("transaction: ", this.transaction);
            console.groupEnd();
            return;
        }
        this.transaction = [];
        this.isTransaction = true;
    }
    flush() {
        if (!this.isTransaction) {
            console.group("Reistate:Instructor");
            console.warn("Running flush before beginTransaction, logical mistake?");
            console.groupEnd();
            return;
        }
        this.store.update(this.transaction[Symbol.iterator]());
        this.isTransaction = false;
    }
    undoTransaction() {
        if (!this.isTransaction) {
            console.group("Reistate:Instructor");
            console.warn("Running undoTransaction before beginTransaction, logical mistake?");
            console.groupEnd();
            return;
        }
        this.isTransaction = false;
    }
    set<TValue>(
        path: IPath<TState, TValue>,
        value: PathValue<TValue>,
        pathArgs?: PathArg[]
    ) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createSet(path, value, pathArgs));
        } else {
            this.store.update([Instructor.createSet(path, value, pathArgs)][Symbol.iterator]());
        }
    }
    add<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>,
        value: PathValue<TValue>,
        pathArgs?: PathArg[]
    ) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createAdd(path, value, pathArgs));
        } else {
            this.store.update([Instructor.createAdd(path, value, pathArgs)][Symbol.iterator]());
        }
    }
    remove<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue[]>,
        index: string | number | IndexSearch<TValue>,
        pathArgs?: PathArg[]
    ) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createRemove(path, index, pathArgs));
        } else {
            this.store.update([Instructor.createRemove(path, index, pathArgs)][Symbol.iterator]());
        }
    }
    static createSet<TState, TValue>(
        path: IPath<TState, TValue>,
        value: PathValue<TValue>,
        pathArgs?: PathArg[]
    ) {
        return { path, args: pathArgs, value, type: InstructionType.set };
    }
    static createAdd<TState, TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>,
        value: PathValue<TValue>,
        pathArgs?: PathArg[]
    ) {
        return { path, args: pathArgs, value, type: InstructionType.add };
    }
    static createRemove<TState, TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue[]>,
        index: string | number | IndexSearch<TValue>,
        pathArgs?: PathArg[]
    ) {
        return { path, args: pathArgs, index, type: InstructionType.remove };
    }
}
