import { IInstruction, IPath, IStoreSchema, Transformator, IScope } from "./interfaces";
import { exchangeIterator, isStore } from "./tools";
import { PathArg } from "interfaces/IPath";
import { IStore } from "./interfaces/IStore";

export class StoreSchema<TState, T> implements IStoreSchema<TState, T> {
    transformator!: Transformator<TState, T>;
    private scopes: IScope<TState, T, any>[];
    constructor(transformator?: Transformator<TState, T>) {
        this.transformator = transformator as any;
        this.scopes = [];
    }
    getState(state: TState | IStore<TState>) {
        return isStore(state) ? state.state : state as any;
    }
    transform(state: TState, instructions: IterableIterator<IInstruction<TState, any>>) {
        if (this.transformator === undefined) {
            for (const scope of this.scopes) {
                instructions = scope.transform(state, instructions);
            }
            return instructions;
        }
        instructions = exchangeIterator(
            instructions,
            instruction => this.transformator(
                instruction,
                this.isInstruction(instruction),
                this.getState(state),
                state
            )
        );
        for (const scope of this.scopes) {
            instructions = scope.transform(state, instructions);
        }
        return instructions;
    }
    addScope(scope: IScope<TState, T, any>) {
        this.scopes.push(scope);
    }
    removeScope(scope: IScope<TState, T, any>) {
        const id = this.scopes.indexOf(scope);
        if (id > -1) {
            this.scopes.splice(id, 1);
        }
    }
    protected isInstruction = (instruction: IInstruction<TState, any>) => (path: IPath<TState, any>, args?: PathArg[], strict?: boolean) => {
        if (args !== undefined && args.length > instruction.args.length) {
            return false;
        }
        const isPathEqual = instruction.path.includes(path, strict);
        if (!isPathEqual || args === undefined || args.length === 0) {
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

export function createSchema<TState, T>(transformator?: Transformator<TState, T>) {
    return new StoreSchema(transformator);
}
