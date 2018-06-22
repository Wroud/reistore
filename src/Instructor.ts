import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexGetter, IndexSearch } from "./interfaces/IInstructor";

export class Instructor<TState> implements IInstructor<TState> {
    private store: IStore<TState>;
    constructor(store: IStore<TState>) {
        this.store = store;
    }
    set<TValue>(path: IPath<TState, TValue>, value: TValue, index?: string | number | IndexGetter<TValue>) {
        this.store.update([Instructor.createSet(path, value, index)][Symbol.iterator]());
    }
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | IndexGetter<TValue>) {
        this.store.update([Instructor.createAdd(path, value, index)][Symbol.iterator]());
    }
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | IndexSearch<TValue>) {
        this.store.update([Instructor.createRemove(path, index)][Symbol.iterator]());
    }
    static createSet<TState, TValue>(path: IPath<TState, TValue>, value: TValue, index?: string | number | IndexGetter<TValue>) {
        return { path, value, type: InstructionType.set, index };
    }
    static createAdd<TState, TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | IndexGetter<TValue>) {
        return { path, index, value, type: InstructionType.add };
    }
    static createRemove<TState, TValue>(path: IPath<TState, TValue[]>, index: string | number | IndexSearch<TValue>) {
        return { path, index, type: InstructionType.remove };
    }
}
