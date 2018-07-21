import { InstructionType } from "./enums/InstructionType";
import { IPath, IInstruction } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexSearch, ValueMap, Injection, Batch, IInject, IBatch } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
import { InstructionValue } from "./interfaces/IInstruction";

export type InstructorBashInject<TState> = IInject<TState> & IBatch<TState>;

export class Instructor<TState> implements InstructorBashInject<TState> {
    private store: IStore<TState>;
    private batchInstructions!: IInstruction<any, any>[];
    private isBatch!: boolean;
    constructor(store: IStore<TState>) {
        this.store = store;
    }
    batch(batch: Batch<TState>) {
        this.beginTransaction();
        batch(this);
        this.flush();
    }
    inject(injection: Injection<TState>) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createInject(injection));
        } else {
            this.store.update([Instructor.createInject(injection)][Symbol.iterator]());
        }
    }
    set<TValue>(
        path: IPath<TState, TValue>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createSet(path, value, ...pathArgs));
        } else {
            this.store.update([Instructor.createSet(path, value, ...pathArgs)][Symbol.iterator]());
        }
    }
    add<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createAdd(path, value, ...pathArgs));
        } else {
            this.store.update([Instructor.createAdd(path, value, ...pathArgs)][Symbol.iterator]());
        }
    }
    remove<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue[]>,
        index: string | number | IndexSearch<TValue>,
        ...pathArgs: PathArg[]
    ) {
        if (this.isBatch) {
            this.batchInstructions.push(Instructor.createRemove(path, index, ...pathArgs));
        } else {
            this.store.update([Instructor.createRemove(path, index, ...pathArgs)][Symbol.iterator]());
        }
    }
    private beginTransaction() {
        if (this.isBatch) {
            console.group("Reistate:Instructor");
            console.error("In same time you can begin only one batch");
            console.error("batch: ", this.batchInstructions);
            console.groupEnd();
            return;
        }
        this.batchInstructions = [];
        this.isBatch = true;
    }
    private flush() {
        this.isBatch = false;
        this.store.update(this.batchInstructions[Symbol.iterator]());
    }
    static createInject<TState>(injection: Injection<TState>) {
        return { type: InstructionType.inject, injection };
    }
    static createSet<TState, TValue>(
        path: IPath<TState, TValue>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        return { path, args: pathArgs, value, type: InstructionType.set };
    }
    static createAdd<TState, TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        return { path, args: pathArgs, value, type: InstructionType.add };
    }
    static createRemove<TState, TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue[]>,
        index: string | number | IndexSearch<TValue>,
        ...pathArgs: PathArg[]
    ) {
        return { path, args: pathArgs, index, type: InstructionType.remove };
    }
}
