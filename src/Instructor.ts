import { InstructionType } from "./enums/InstructionType";
import { IInstructor, IPath } from "./interfaces";
import { IStore } from "./interfaces/IStore";

export class Instructor<TState> implements IInstructor<TState> {
    private store: IStore<TState>;
    constructor(store: IStore<TState>) {
        this.store = store;
    }
    set<TValue>(path: IPath<TState, TValue>, value: TValue) {
        this.store.update([
            { path, value, type: InstructionType.set }
        ][Symbol.iterator]());
    }
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | ((value: TValue[]) => string | number)) {
        this.store.update([
            { path, index, value, type: InstructionType.add }
        ][Symbol.iterator]());
    }
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | ((value: TValue, index: string | number) => boolean)) {
        this.store.update([
            { path, index, type: InstructionType.remove }
        ][Symbol.iterator]());
    }
}
