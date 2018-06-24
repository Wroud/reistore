import { IInstruction, IPath, Transformator, ISchema, IStore, PathArg } from "./interfaces";
import { exchangeIterator } from "./tools";

export abstract class Schema<TState, T> implements ISchema<TState, T> {
    transformator!: Transformator<TState, T>;
    protected scopes: ISchema<TState, any>[];
    protected initState: T;
    constructor(initState?: T, transformator?: Transformator<TState, T>) {
        this.initState = initState || {} as any;
        this.transformator = transformator as any;
        this.scopes = [];
    }
    abstract setInitState(store: IStore<TState>);
    abstract getState(state: TState | IStore<TState>);
    transform(state: TState, instructions: IterableIterator<IInstruction<TState, any>>) {
        if (this.transformator !== undefined) {
            instructions = exchangeIterator(
                instructions,
                instruction => this.transformator(
                    instruction,
                    this.isInstruction(instruction),
                    this.getState(state),
                    state
                )
            );
        }
        for (const scope of this.scopes) {
            instructions = scope.transform(state, instructions);
        }
        return instructions;
    }
    bindSchema(schema: ISchema<TState, any>) {
        this.scopes.push(schema);
    }
    unBindSchema(schema: ISchema<TState, any>) {
        const id = this.scopes.indexOf(schema);
        if (id > -1) {
            this.scopes.splice(id, 1);
        }
    }
    protected isInstruction = (instruction: IInstruction<TState, any>) =>
        (path: IPath<TState, any>, args?: PathArg[], strict?: boolean) => {
            if (
                args !== undefined
                && (
                    instruction.args === undefined
                    || args.length > instruction.args.length
                )
            ) {
                return false;
            }
            const isPathEqual = instruction.path.includes(path, strict);
            if (
                !isPathEqual
                || args === undefined
                || instruction.args === undefined
                || args.length === 0
            ) {
                return isPathEqual;
            }
            for (let i = 0; i < args.length; i++) {
                if (args[i] !== instruction.args[i]) {
                    return false;
                }
            }
            return true;
        }
}
