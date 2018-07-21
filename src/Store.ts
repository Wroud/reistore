import { InstructionType } from "./enums/InstructionType";
import { Instructor } from "./Instructor";
import { IInstruction, IUpdateHandler, IPath, Handler } from "./interfaces";
import { UpdateHandler } from "./UpdateHandler";
import { IStoreInstructor } from "./interfaces/IStore";
import { StoreSchema } from "./StoreSchema";
import { IndexSearch, ValueMap, Batch, IBatch } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
import { ISchema, Transformator } from "./interfaces/ISchema";
import { InstructionValue } from "./interfaces/IInstruction";

export class Store<TState> implements IStoreInstructor<TState> {
    instructor: IBatch<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState, TState>;
    private stateStore!: TState;
    private updateList!: IPath<TState, any>[];
    private isUpdating: boolean;
    private isImmutable: boolean;
    private isInjecting: boolean;
    constructor(
        schema?: ISchema<TState, TState>,
        initState?: TState,
        transformator?: Transformator<TState, TState>,
        isImmutable: boolean = true
    ) {
        if (!schema) {
            schema = new StoreSchema(initState, transformator);
        }
        if (initState) {
            this.stateStore = { ...initState as any };
        }
        this.isImmutable = isImmutable;
        this.isInjecting = false;
        this.isUpdating = false;
        this.schema = schema;
        this.instructor = new Instructor(this);
        this.updateHandler = new UpdateHandler();
        this.schema.setInitState(this);
    }
    get state() {
        return this.stateStore;
    }
    set state(value: TState) {
        this.stateStore = value;
    }
    batch(batch: Batch<TState>) {
        this.instructor.batch(batch);
    }
    get<TValue>(
        path: IPath<TState, TValue>,
        ...pathArgs: PathArg[]
    ) {
        return path.get(this.stateStore, undefined, pathArgs);
    }
    set<TValue>(
        path: IPath<TState, TValue>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        this.instructor.set(path, value, ...pathArgs);
    }
    add<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue | TValue[]>,
        value: InstructionValue<TValue>,
        ...pathArgs: PathArg[]
    ) {
        this.instructor.add(path, value, ...pathArgs);
    }
    remove<TValue>(
        path: IPath<TState, ValueMap<TValue> | TValue[]>,
        index: string | number | IndexSearch<TValue>,
        ...pathArgs: PathArg[]
    ) {
        this.instructor.remove(path, index, ...pathArgs);
    }
    update(instructions: IterableIterator<IInstruction<TState, any>>) {
        if (this.isInjecting) {
            this.transformState(instructions);
            return;
        }
        if (this.isUpdating) {
            console.group("Reistate:Store");
            console.error("Trying to run update before last update finished, asynchronous problem?");
            console.error("store: ", this);
            console.groupEnd();
            return;
        }
        this.isUpdating = true;
        if (this.isImmutable) {
            this.stateStore = { ...this.stateStore as any };
        }
        this.updateList = [];
        this.transformState(instructions);
        this.updateHandler.update(this.stateStore, this.updateList);
        this.isUpdating = false;
    }
    private transformState(instructions: IterableIterator<IInstruction<TState, any>>) {
        instructions = this.schema.transform(this.stateStore, instructions);
        for (const { type, path, value, index, args, injection } of instructions) {
            switch (type) {
                case InstructionType.inject:
                    if (!injection) {
                        break;
                    }
                    if (this.isInjecting) {
                        injection(this.stateStore, this);
                    } else {
                        this.isInjecting = true;
                        injection(this.stateStore, this);
                        this.isInjecting = false;
                    }
                    break;
                case InstructionType.set:
                case InstructionType.add:
                    if (path) {
                        this.updateList.push(path);
                        if (this.isImmutable) {
                            path.setImmutable(this.stateStore, value, args);
                        } else {
                            path.set(this.stateStore, value, args);
                        }
                    }
                    break;
                case InstructionType.remove:
                    if (index === undefined) {
                        console.error("You need specify index for removing element");
                        break;
                    }
                    if (path) {
                        this.updateList.push(path);
                        if (this.isImmutable) {
                            path.setImmutable(this.stateStore, curValue => {
                                if (!Array.isArray(curValue)) {
                                    const id = typeof index === "function"
                                        ? (index as any)(curValue)
                                        : index;
                                    const { [id]: _, ...newValue } = curValue;
                                    return newValue;
                                } else if (typeof index === "function") {
                                    return curValue.filter(index);
                                } else {
                                    return curValue.filter((v, i) => i !== index);
                                }
                            }, args);
                        } else {
                            path.set(this.stateStore, curValue => {
                                if (!Array.isArray(curValue)) {
                                    const id = typeof index === "function"
                                        ? (index as any)(curValue)
                                        : index;
                                    const { [id]: _, ...newValue } = curValue;
                                    return newValue;
                                } else if (typeof index === "function") {
                                    return curValue.filter(index);
                                } else {
                                    return curValue.filter((v, i) => i !== index);
                                }
                            }, args);
                        }
                    }
                    break;
            }
        }
    }
    subscribe(handler: Handler<TState>) {
        this.updateHandler.subscribe(handler);
        return this;
    }
    unSubscribe(handler: Handler<TState>) {
        this.updateHandler.unSubscribe(handler);
        return this;
    }
}

export function createStore<TState>(
    schema?: ISchema<TState, TState>,
    initState?: TState,
    transformator?: Transformator<TState, TState>,
    isImmutable: boolean = true
) {
    return new Store(schema, initState, transformator, isImmutable);
}
