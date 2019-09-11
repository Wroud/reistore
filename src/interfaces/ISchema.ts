import { IInstruction } from "./IInstruction";
import { ITransformer } from "./IInstructor";

export type ApplyChange<TState extends object | any[] | Map<any, any>> = (
    change: IInstruction<TState, any>
) => void;
export type Transformator<TState, TScope> = (
    instruction: IInstruction<TState, any>,
    transformer: ITransformer<TState, TScope>
) => void;
