import { expect } from "chai";
import "mocha";

import { Path, createStore, createSchema, createScope, Instructor } from "../src/";

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
        function* transformer(instruction, is, state) {
            if (is(scopeValue) && instruction.value !== undefined) {
                yield Instructor.createSet(stateValue, instruction.value.toString());
            }
            yield instruction;
        }
        const schema = createSchema<IModel>({} as IModel, transformer);
        const store = createStore<IModel>(schema);
        const scopeValue = Path.fromSelector<IModel, number>(f => f.scope.value);
        const stateValue = Path.fromSelector<IModel, string>(f => f.value);
        function* scopeTransformer(instruction, is, state) {
            if (is(Path.fromSelector(f => f.value)) && instruction.value !== undefined) {
                yield Instructor.createSet(Path.fromSelector(f => f.scope.value), parseInt(instruction.value));
            }
            yield instruction;
        }
        const scope = createScope(schema, f => f.scope, {}, scopeTransformer);
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
