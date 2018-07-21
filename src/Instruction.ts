import { IInstruction, IPath, PathArg, Injection, InstructionValue } from "./interfaces";
import { InstructionType } from "./enums/InstructionType";

export class Instruction<TState, TValue> implements IInstruction<TState, TValue> {
    type: InstructionType;
    path?: IPath<TState, TValue | TValue[]>;
    index?: PathArg | ((value: TValue, index: string | number) => boolean);
    args?: PathArg[];
    value?: InstructionValue<TValue>;
    injection?: Injection<TState>;
    constructor(
        type: InstructionType,
        path?: IPath<TState, TValue | TValue[]>,
        index?: PathArg | ((value: TValue, index: string | number) => boolean),
        args?: PathArg[],
        value?: InstructionValue<TValue>,
        injection?: Injection<TState>
    ) {
        this.type = type;
        this.path = path;
        this.index = index;
        this.args = args;
        this.value = value;
        this.injection = injection;
    }
    in(path: IPath<TState, any>, args?: PathArg[], strict?: boolean) {
        if (
            args !== undefined
            && (
                this.args === undefined
                || args.length > this.args.length
            )
            || !this.path
        ) {
            return false;
        }
        const isPathEqual = this.path.includes(path, strict);
        if (
            !isPathEqual
            || args === undefined
            || this.args === undefined
            || args.length === 0
        ) {
            return isPathEqual;
        }
        for (let i = 0; i < args.length; i++) {
            if (args[i] !== this.args[i]) {
                return false;
            }
        }
        return true;
    }

}