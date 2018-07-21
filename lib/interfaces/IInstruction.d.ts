import { InstructionType } from "../enums/InstructionType";
import { IPath, PathArg } from "./IPath";
import { Injection } from "./IInstructor";
export declare type IsInstructionInPath<TState> = (selector: IPath<TState, any>, args?: PathArg[], strict?: boolean) => boolean;
export declare type InstructionValue<T> = T | ((value: T) => T);
export interface IInstruction<TState, TValue> {
    path?: IPath<TState, TValue | TValue[]>;
    index?: PathArg | ((value: TValue, index: string | number) => boolean);
    args?: PathArg[];
    type: InstructionType;
    value?: InstructionValue<TValue>;
    injection?: Injection<TState>;
    in: IsInstructionInPath<TState>;
}
