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
    in(path: IPath<TState, any>, strict?: boolean, ...args: PathArg[]) {
        if (!this.path) {
            return false;
        }
        if ((!this.args || this.args.length === 0) && args.length === 0) {
            return this.path === path || this.path.includes(path, strict);
        }
        if (!this.args || args.length > this.args.length) {
            return false;
        }
        if (this.path === path) {
            if (this.args.length !== args.length) {
                return false;
            }
            for (let i = 0; i < this.args.length; i++) {
                if (this.args[i] !== args[i]) {
                    return false;
                }
            }
            return true;
        }
        const instructionPathWithArgs = this.path.getPath(this.args);
        const pathWithArgs = path.getPath(args);

        return strict
            ? instructionPathWithArgs === pathWithArgs
            : instructionPathWithArgs.startsWith(pathWithArgs);
    }

}