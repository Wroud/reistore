import { IInstruction } from "./IInstruction";
import { IStore } from "./IStore";
import { ITransformer } from "./IInstructor";

export type ApplyChange<TState extends object | any[] | Map<any, any>> = (
    store: IStore<TState>,
    change: IInstruction<TState, any>
) => void;
export type Transformator<TState, TScope> = (
    instruction: IInstruction<TState, any>,
    transformer: ITransformer<TState, TScope>
) => void;

export interface ISchema<TState extends object | any[] | Map<any, any>> {
    schema: ISchema<TState>;
    bindSchema(schema: ISchema<TState>);
    unBindSchema(schema: ISchema<TState>);
    transform: ApplyChange<TState>;
}