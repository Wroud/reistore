import { IInstruction, IPath, PathArg, Injection, InstructionValue } from "./interfaces";
import { InstructionType } from "./enums/InstructionType";
export declare class Instruction<TState, TValue> implements IInstruction<TState, TValue> {
    type: InstructionType;
    path?: IPath<TState, TValue | TValue[]>;
    index?: PathArg | ((value: TValue, index: string | number) => boolean);
    args?: PathArg[];
    value?: InstructionValue<TValue>;
    injection?: Injection<TState>;
    constructor(type: InstructionType, path?: IPath<TState, TValue | TValue[]>, index?: PathArg | ((value: TValue, index: string | number) => boolean), args?: PathArg[], value?: InstructionValue<TValue>, injection?: Injection<TState>);
    in(path: IPath<TState, any>, strict?: boolean, ...args: PathArg[]): boolean;
}
