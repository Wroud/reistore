import { IInstruction } from "./IInstruction";
import { IStore } from "./IStore";
import { ITransformer } from "./ITransformator";
export declare type ValueSelector<TState, TValue> = (state: TState) => TValue;
export declare type Transformator<TState, TScope> = (instruction: IInstruction<TState, any>, transformer: ITransformer<TState, TScope>) => IterableIterator<IInstruction<TState, any>>;
export interface ISchema<TState, TParent> {
    setInitState(store: IStore<TState>): any;
    getState(state: TState | IStore<TState>): TParent;
    bindSchema<T>(schema: ISchema<TState, T>): any;
    unBindSchema<T>(schema: ISchema<TState, T>): any;
    transform(state: TState, instructins: IterableIterator<IInstruction<TState, any>>): IterableIterator<IInstruction<TState, any>>;
}
