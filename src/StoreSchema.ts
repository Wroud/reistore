import { IInstruction, IPath, IStoreSchema, Transformator, IScope } from "./interfaces";
import { exchangeIterator } from "./tools";

export class StoreSchema<TState, T> implements IStoreSchema<TState, T> {
    transformator!: Transformator<TState, T>;
    private scopes: IScope<TState, T, any>[];
    constructor(transformator?: Transformator<TState, T>) {
        this.transformator = transformator as any;
        this.scopes = [];
    }
    getState(state: TState) {
        return state as any;
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
                this.getState(state)
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
    protected isInstruction = (instruction: IInstruction<TState, any>) => (path: IPath<TState, any>, strict?: boolean) => {
        return instruction.path.includes(path, strict);
    }
}
