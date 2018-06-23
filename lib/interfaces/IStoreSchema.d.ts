import { IInstruction } from "./IInstruction";
import { IPath, PathArg } from "./IPath";
import { IScope } from "./IScope";
import { IStore } from "./IStore";
export declare type ValueSelector<TModel, TValue> = (state: TModel) => TValue;
export declare type IsInstruction<TModel> = <TValue>(selector: IPath<TModel, TValue>, args?: PathArg[], strict?: boolean) => boolean;
export declare type Transformator<TState, T> = (instruction: IInstruction<TState, any>, is: IsInstruction<TState>, state: T, storeState: TState) => IterableIterator<IInstruction<TState, any>>;
export interface IStoreSchema<TState, TModel> {
    getState(state: TState | IStore<TState>): TModel;
    addScope(scope: IScope<TState, TModel, any>): any;
    removeScope(scope: IScope<TState, TModel, any>): any;
    transform(state: TState, instructins: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
}
