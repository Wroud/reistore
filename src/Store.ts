import { InstructionType } from "./enums/InstructionType";
import { Instructor } from "./Instructor";
import { IInstruction, IInstructor, IUpdateHandler, IPath, Handler } from "./interfaces";
import { UpdateHandler } from "./UpdateHandler";
import { IStore } from "./interfaces/IStore";
import { StoreSchema } from "./StoreSchema";
import { IndexSearch, ValueMap, Injection } from "./interfaces/IInstructor";
import { PathArg } from "./interfaces/IPath";
import { ISchema, Transformator } from "./interfaces/ISchema";
import { InstructionValue } from "./interfaces/IInstruction";

type IStoreInstructor<TState> = IStore<TState> & IInstructor<TState>;

export class Store<TState> implements IStoreInstructor<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler<TState>;
    schema: ISchema<TState, TState>;
    private stateStore!: TState;
    private isUpdating: boolean;
    private isImmutable: boolean;
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
    getTransaction() {
        return this.instructor.getTransaction();
    }
    beginTransaction() {
        this.instructor.beginTransaction();
    }
    flush() {
        this.instructor.flush();
    }
    undoTransaction() {
        this.instructor.undoTransaction();
    }
    inject(injection: Injection<TState>) {
        this.instructor.inject(injection);
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
        const updateList = this.transformState(instructions);
        this.updateHandler.update(this.stateStore, updateList);
        this.isUpdating = false;
    }
    private transformState(instructions: IterableIterator<IInstruction<TState, any>>) {
        instructions = this.schema.transform(this.stateStore, instructions);
        const updateList: IPath<TState, any>[] = [];
        for (const { type, path, value, index, args, injection } of instructions) {
            switch (type) {
                case InstructionType.inject:
                    if (injection) {
                        const inject = new Instructor(this);
                        inject.beginTransaction();
                        injection(this.stateStore, inject);
                        updateList.push(...this.transformState(inject.getTransaction()[Symbol.iterator]()));
                    }
                    break;
                case InstructionType.set:
                case InstructionType.add:
                    if (path) {
                        updateList.push(path);
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
                        updateList.push(path);
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
        return updateList;
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
