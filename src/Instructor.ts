import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath, IInstruction } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexGetter, IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";

export class Instructor<TState> implements IInstructor<TState> {
    private store: IStore<TState>;
    private transaction!: IInstruction<any, any>[];
    private isTransaction!: boolean;
    constructor(store: IStore<TState>) {
        this.store = store;
    }
    beginTransaction() {
        this.transaction = [];
        this.isTransaction = true;
    }
    flush() {
        this.store.update(this.transaction[Symbol.iterator]());
        this.isTransaction = false;
    }
    undoTransaction(){
        this.transaction = [];
        this.isTransaction = false;
    }
    set<TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createSet(path, value, pathArgs, index));
        } else {
            this.store.update([Instructor.createSet(path, value, pathArgs, index)][Symbol.iterator]());
        }
    }
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createAdd(path, value, pathArgs, index));
        } else {
            this.store.update([Instructor.createAdd(path, value, pathArgs, index)][Symbol.iterator]());
        }
    }
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[], index: string | number | IndexSearch<TValue>) {
        if (this.isTransaction) {
            this.transaction.push(Instructor.createRemove(path, pathArgs, index));
        } else {
            this.store.update([Instructor.createRemove(path, pathArgs, index)][Symbol.iterator]());
        }
    }
    static createSet<TState, TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs: PathArg[] = [], index?: string | number | IndexGetter<TValue>) {
        return { path, args: pathArgs, index, value, type: InstructionType.set };
    }
    static createAdd<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs: PathArg[] = [], index?: string | number | IndexGetter<TValue>) {
        return { path, args: pathArgs, index, value, type: InstructionType.add };
    }
    static createRemove<TState, TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[], index: string | number | IndexSearch<TValue>) {
        return { path, args: pathArgs, index, type: InstructionType.remove };
    }
}
