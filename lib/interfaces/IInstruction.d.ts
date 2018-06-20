import { InstructionType } from "../enums/InstructionType";
import { IPath } from "./IPath";
export interface IInstruction<TState, TValue> {
    path: IPath<TState, TValue | TValue[]>;
    index?: string | number | ((value: TValue[]) => string | number) | ((value: TValue, index: string | number) => boolean);
    type: InstructionType;
    value?: TValue;
}
