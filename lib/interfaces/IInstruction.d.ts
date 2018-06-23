import { InstructionType } from "../enums/InstructionType";
import { IPath, PathArg } from "./IPath";
export interface IInstruction<TState, TValue> {
    path: IPath<TState, TValue | TValue[]>;
    index?: PathArg | ((value: TValue, index: string | number) => boolean);
    args: PathArg[];
    type: InstructionType;
    value?: TValue;
}
