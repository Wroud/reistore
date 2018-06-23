import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";
import { IndexGetter, IndexSearch, ValueMap } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";

export class Instructor<TState> implements IInstructor<TState> {
    private store: IStore<TState>;
    constructor(store: IStore<TState>) {
        this.store = store;
    }
    set<TValue>(path: IPath<TState, TValue>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>) {
        this.store.update([Instructor.createSet(path, value, pathArgs, index)][Symbol.iterator]());
    }
    add<TValue>(path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>, value: TValue, pathArgs?: PathArg[], index?: string | number | IndexGetter<TValue>) {
        this.store.update([Instructor.createAdd(path, value, pathArgs, index)][Symbol.iterator]());
    }
    remove<TValue>(path: IPath<TState, ValueMap<TValue> | TValue[]>, pathArgs: PathArg[], index: string | number | IndexSearch<TValue>) {
        this.store.update([Instructor.createRemove(path, pathArgs, index)][Symbol.iterator]());
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
