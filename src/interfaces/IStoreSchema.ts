import { IInstruction } from "./IInstruction";
import { IPath } from "./IPath";
import { IScope } from "./IScope";

export type ValueSelector<TModel, TValue> = (state: TModel) => TValue;
export type IsInstruction<TModel> = <TValue>(selector: IPath<TModel, TValue>) => boolean;
export type Transformator<TState, T> = (instruction: IInstruction<TState, any>, is: IsInstruction<TState>, state: T) => IterableIterator<IInstruction<TState, any>>;

export interface IStoreSchema<TState, TModel> {
    getState(state: TState): TModel;
    addScope(scope: IScope<TState, TModel, any>);
    removeScope(scope: IScope<TState, TModel, any>);
    transform(state: TState, instructins: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
}
