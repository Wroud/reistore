import { IInstruction } from "./IInstruction";
import { IPath, PathArg } from "./IPath";
import { IStore } from "./IStore";

export type ValueSelector<TState, TValue> = (state: TState) => TValue;
export type IsInstruction<TState> = <TValue>(selector: IPath<TState, TValue>, args?: PathArg[], strict?: boolean) => boolean;
export type Transformator<TState, T> = (instruction: IInstruction<TState, any>, is: IsInstruction<TState>, state: T, storeState: TState) => IterableIterator<IInstruction<TState, any>>;

export interface ISchema<TState, TParent> {
    setInitState(store: IStore<TState>);
    getState(state: TState | IStore<TState>): TParent;
    bindSchema<T>(schema: ISchema<TState, T>);
    unBindSchema<T>(schema: ISchema<TState, T>);
    transform(state: TState, instructins: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
}