import { InstructionType } from "../enums/InstructionType";
import { IPath, PathArg } from "./IPath";
import { Injection } from "./IInstructor";

export type IsInstructionInPath<TState> = (selector: IPath<TState, any>, strict?: boolean, ...args: PathArg[]) => boolean;
export type InstructionValue<T> = T | ((value: T) => T);

export interface IInstruction<TState, TValue> {
    path?: IPath<TState, TValue | TValue[]>;
    index?: PathArg | ((value: TValue, index: string | number) => boolean);
    args?: PathArg[];
    type: InstructionType;
    value?: InstructionValue<TValue>;
    injection?: Injection<TState>;
    in: IsInstructionInPath<TState>;
}
