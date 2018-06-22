import { InstructionType } from "./enums/InstructionType";
import { Instructor } from "./Instructor";
import { IInstruction, IInstructor, IStoreSchema, IUpdateHandler, IPath } from "./interfaces";
import { UpdateHandler } from "./UpdateHandler";
import { IStore } from "./interfaces/IStore";
import { StoreSchema } from "./StoreSchema";
import { IndexGetter, IndexSearch } from "./interfaces/IInstructor";

type IStoreInstructor<TState> = IStore<TState> & IInstructor<TState>;

export class Store<TState> implements IStoreInstructor<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler;
    schema: IStoreSchema<TState, TState>;
    private stateStore: TState;
    constructor(schema?: IStoreSchema<TState, TState>, initState?: TState) {
        if (!schema) {
            schema = new StoreSchema();
        }
        this.schema = schema;
        if (initState === undefined) {
            this.stateStore = {} as any;
        } else {
            this.stateStore = initState;
        }
        this.instructor = new Instructor(this);
        this.updateHandler = new UpdateHandler();
    }
    get state() {
        return this.stateStore;
    }
    set<TValue>(path: IPath<TState, TValue>, value: TValue, index?: string | number | IndexGetter<TValue>) {
        this.instructor.set(path, value, index);
    }
    add<TValue>(path: IPath<TState, TValue[]>, value: TValue, index?: string | number | IndexGetter<TValue>) {
        this.instructor.add(path, value, index);
    }
    remove<TValue>(path: IPath<TState, TValue[]>, index: string | number | IndexSearch<TValue>) {
        this.instructor.remove(path, index);
    }
    update(instructions: IterableIterator<IInstruction<TState, any>>) {
        this.stateStore = { ...this.stateStore as any };
        instructions = this.schema.transform(this.stateStore, instructions);
        for (const { type, path, value, index } of instructions) {
            let curValue;
            switch (type) {
                case InstructionType.set:
                    if (typeof index === "function") {
                        curValue = path.get(this.stateStore, []) as any[];
                        if (!Array.isArray(curValue)) {
                            const newIndex = (index as (array: any[]) => number | string)(curValue);
                            path.setImmutable(this.stateStore, { ...curValue, [newIndex]: value });
                            break;
                        }
                        const newValue = [...curValue];
                        const newIndex = (index as (array: any[]) => number | string)(curValue);
                        newValue[newIndex] = value;
                        path.setImmutable(this.stateStore, newValue);
                    } else if (index !== undefined) {
                        curValue = path.get(this.stateStore, []) as any[];
                        if (!Array.isArray(curValue)) {
                            path.setImmutable(this.stateStore, { ...curValue, [index]: value });
                            break;
                        }
                        const newValue = [...curValue];
                        newValue[index] = value;
                        path.setImmutable(this.stateStore, newValue);
                    } else {
                        path.setImmutable(this.stateStore, value);
                    }
                    break;
                case InstructionType.add:
                    curValue = path.get(this.stateStore, []) as any[];
                    if (typeof index === "function") {
                        if (!Array.isArray(curValue)) {
                            const newIndex = (index as (array: any[]) => number | string)(curValue);
                            path.setImmutable(this.stateStore, { ...curValue, [newIndex]: value });
                            break;
                        }
                        const newValue = [...curValue];
                        const newIndex = (index as (array: any[]) => number | string)(curValue);
                        newValue[newIndex] = value;
                        path.setImmutable(this.stateStore, newValue);
                    } else if (index !== undefined) {
                        if (!Array.isArray(curValue)) {
                            path.setImmutable(this.stateStore, { ...curValue, [index]: value });
                            break;
                        }
                        const newValue = [...curValue];
                        newValue[index] = value;
                        path.setImmutable(this.stateStore, newValue);
                    } else {
                        path.setImmutable(this.stateStore, [...curValue, value]);
                    }
                    break;
                case InstructionType.remove:
                    if (index === undefined) {
                        break;
                    }
                    curValue = path.get(this.stateStore, []) as any[];
                    if (!Array.isArray(curValue)) {
                        const id = typeof index === "function"
                            ? (index as any)(curValue)
                            : index;
                        const { [id]: _, ...newValue } = curValue;
                        path.setImmutable(this.stateStore, newValue);
                    } else {
                        if (typeof index === "function") {
                            path.setImmutable(this.stateStore, curValue.filter(index));
                        } else {
                            path.setImmutable(this.stateStore, curValue.filter((v, i) => i !== index));
                        }
                    }
                    break;
            }
        }
        this.updateHandler.update();
    }
}

export function createStore<TState>(schema?: IStoreSchema<TState, TState>, initState?: TState) {
    return new Store(schema, initState);
}
