import { IInstruction } from "./IInstruction";
import { IPath } from "./IPath";
import { ITransformer } from "./ITransformer";
import { IScope } from "./IScope";
export declare type ValueSelector<TModel, TValue> = (state: TModel) => TValue;
export declare type IsInstruction<TModel> = <TValue>(selector: IPath<TModel, TValue>) => boolean;
export declare type Transformator<TState, T> = (instruction: IInstruction<TState, any>, is: IsInstruction<TState>, transformer: ITransformer<TState>, state: T) => void;
export interface IStoreSchema<TState, TModel> {
    getState(state: TState): TModel;
    addScope(scope: IScope<TState, TModel, any>): any;
    removeScope(scope: IScope<TState, TModel, any>): any;
    transform(state: TState, instructins: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
}
