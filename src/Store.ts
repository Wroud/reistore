import { InstructionType } from "./enums/InstructionType";
import { Instructor } from "./Instructor";
import { IInstruction, IInstructor, IPath, IStore, Transformator, IUpdateHandler, IScope } from "./interfaces";
import { exchangeIterator } from "./tools";
import { Transformer } from "./Transformer";
import { UpdateHandler } from "./UpdateHandler";

export class Store<TState, T> implements IStore<TState, T> {
    instructor: IInstructor<TState>;
    transformator!: Transformator<TState, T>;
    updateHandler: IUpdateHandler;
    private stateStore: TState;
    private scopes: IScope<TState, T, any>[];
    constructor(initState: T = {} as any, transformator?: Transformator<TState, T>) {
        this.stateStore = initState as any;
        this.transformator = transformator as any;
        this.instructor = new Instructor(this);
        this.updateHandler = new UpdateHandler();
        this.scopes = [];
    }
    get state() {
        return this.stateStore as any;
    }
    transform(instructions: IterableIterator<IInstruction<TState, any>>) {
        if (this.transformator === undefined) {
            for (const scope of this.scopes) {
                instructions = scope.transform(instructions);
            }
            return instructions;
        }
        instructions = exchangeIterator(
            instructions,
            instruction => {
                const transformer = new Transformer(instruction);
                this.transformator(
                    instruction,
                    this.isInstruction(instruction),
                    transformer,
                    this.stateStore as any
                );
                return transformer.toIterator();
            }
        );
        for (const scope of this.scopes) {
            instructions = scope.transform(instructions);
        }
        return instructions;
    }
    update(instructions: IterableIterator<IInstruction<TState, any>>) {
        instructions = this.transform(instructions);
        this.stateStore = { ...this.stateStore as any };
        for (const { type, path, value, index } of instructions) {
            let curValue;
            switch (type) {
                case InstructionType.set:
                    path.setImmutable(this.stateStore, value);
                    break;
                case InstructionType.add:
                    curValue = path.get(this.stateStore, []) as any[];
                    if (typeof index === "function") {
                        const newValue = [...curValue];
                        const newIndex = (index as (array: any[]) => number | string)(curValue);
                        newValue[newIndex] = value;
                        path.setImmutable(this.stateStore, newValue);
                    } else if (index !== undefined) {
                        const newValue = [...curValue];
                        newValue[index] = value;
                        path.setImmutable(this.stateStore, newValue);
                    } else {
                        path.setImmutable(this.stateStore, [...curValue, value]);
                    }
                    break;
                case InstructionType.remove:
                    curValue = path.get(this.stateStore, []) as any[];
                    if (typeof index === "function") {
                        path.setImmutable(this.stateStore, curValue.filter(index));
                    } else {
                        path.setImmutable(this.stateStore, curValue.filter((v, i) => i === index));
                    }
                    break;
            }
        }
        this.updateHandler.update();
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
