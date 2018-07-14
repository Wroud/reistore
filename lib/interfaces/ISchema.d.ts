import { IInstruction } from "./IInstruction";
import { IPath, PathArg } from "./IPath";
import { IStore } from "./IStore";
export declare type ValueSelector<TState, TValue> = (state: TState) => TValue;
export declare type IsInstruction<TState> = <TValue>(selector: IPath<TState, TValue>, args?: PathArg[], strict?: boolean) => boolean;
export declare type Transformator<TState, T> = (instruction: IInstruction<TState, any>, is: IsInstruction<TState>, state: () => T, storeState: TState) => IterableIterator<IInstruction<TState, any>>;
export interface ISchema<TState, TParent> {
    setInitState(store: IStore<TState>): any;
    getState(state: TState | IStore<TState>): TParent;
    bindSchema<T>(schema: ISchema<TState, T>): any;
    unBindSchema<T>(schema: ISchema<TState, T>): any;
    transform(state: TState, instructins: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
}
