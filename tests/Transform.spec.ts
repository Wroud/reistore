import { expect } from "chai";
import "mocha";

import { Path } from "../src/Path";
import { Store } from "../src/Store";
import { StoreSchema } from "../src/StoreSchema";
import { Scope } from "../src/Scope";
import { Instructor } from "../src/Instructor";

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
        const schema = new StoreSchema<IModel, IModel>(transformer);
        const store = new Store<IModel>(schema);
        const scopeValue = Path.fromSelector<IModel, number>(f => f.scope.value);
        const stateValue = Path.fromSelector<IModel, string>(f => f.value);
        function* scopeTransformer(instruction, is, state) {
            if (is(Path.fromSelector(f => f.value)) && instruction.value !== undefined) {
                yield Instructor.createSet(Path.fromSelector(f => f.scope.value), parseInt(instruction.value));
            }
            yield instruction;
        }
        const scope = new Scope(schema, Path.fromSelector(f => f.scope), scopeTransformer);
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
        store.instructor.set(Path.fromSelector(f => f.scope.value), 0);
        expect(store.state.scope.value).to.be.equal(0);
        expect(store.state.value).to.be.equal("0");
        expect(store.state).to.be.deep.equal(expectedState);

        store.instructor.set(Path.fromSelector(f => f.value), "1");
        expect(store.state.scope.value).to.be.equal(1);
        expect(store.state.value).to.be.equal("1");
        expect(store.state).to.be.deep.equal(expectedState1);
    });

});
