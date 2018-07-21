import { expect } from "chai";
import "mocha";

import { Path, createStore, createSchema, createScope, Instructor, IInstruction, ITransformer } from "../src/";

describe("Transform", () => {
    interface IArray {
        number: number
    }
    interface IIArray {
        [key: number]: IArray
    }
    interface IModel {
        value: string;
        scope: {
            value: number;
            array: IArray[],
            indexedArray: IIArray
        }
    }

    it("two transformers with scope", () => {
        function* transformer(
            instruction: IInstruction<IModel, any>,
            transformer: ITransformer<IModel, IModel>
        ) {
            if (instruction.in(scopeValue) && instruction.value !== undefined) {
                yield transformer.set(stateValue, instruction.value.toString());
            }
            yield instruction;
        }

        const schema = createSchema<IModel>({} as IModel, transformer);
        const scopeValue = Path.create<IModel, number>(f => f.scope.value);
        const stateValue = Path.create<IModel, string>(f => f.value);

        function* scopeTransformer(
            instruction: IInstruction<IModel, any>,
            transformer: ITransformer<IModel, IModel["scope"]>
        ) {
            if (instruction.in(Path.create(f => f.value)) && instruction.value !== undefined) {
                yield transformer.set(Path.create(f => f.scope.value), parseInt(instruction.value));
            }
            yield instruction;
        }

        const scope = createScope(schema, f => f.scope, {}, scopeTransformer);
        const store = createStore<IModel>(schema);
        const expectedState = {
            value: "0",
            scope: {
                value: 0
            }
        }
        const expectedState1 = {
            value: "1",
            scope: {
                value: 1
            }
        }
        store.set(scopeValue, 0);
        expect(store.state.scope.value).to.be.equal(0);
        expect(store.state.value).to.be.equal("0");
        expect(store.state).to.be.deep.equal(expectedState);

        store.set(stateValue, "1");
        expect(store.state.scope.value).to.be.equal(1);
        expect(store.state.value).to.be.equal("1");
        expect(store.state).to.be.deep.equal(expectedState1);
    });

});
