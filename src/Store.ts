import { InstructionType } from "./enums/InstructionType";
import { Instructor } from "./Instructor";
import { IInstruction, IInstructor, IStoreSchema, IUpdateHandler } from "./interfaces";
import { UpdateHandler } from "./UpdateHandler";
import { IStore } from "./interfaces/IStore";

export class Store<TState> implements IStore<TState> {
    instructor: IInstructor<TState>;
    updateHandler: IUpdateHandler;
    private schema: IStoreSchema<TState, TState>;
    private stateStore: TState;
    constructor(schema: IStoreSchema<TState, TState>, initState?: TState) {
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