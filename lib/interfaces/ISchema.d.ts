import { IInstruction } from "./IInstruction";
import { IStore } from "./IStore";
import { ITransformer } from "./IInstructor";
export declare type ApplyChange<TState extends object | any[] | Map<any, any>> = (store: IStore<TState>, change: IInstruction<TState, any>) => void;
export declare type Transformator<TState, TScope> = (instruction: IInstruction<TState, any>, transformer: ITransformer<TState, TScope>) => void;
export interface ISchema<TState extends object | any[] | Map<any, any>> {
    schema: ISchema<TState>;
    bindSchema(schema: ISchema<TState>): any;
    unBindSchema(schema: ISchema<TState>): any;
    transform: ApplyChange<TState>;
}
