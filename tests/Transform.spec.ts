import { expect } from "chai";
import "mocha";

import { Path } from "../src/Path";
import { Store } from "../src/Store";
import { Scope } from "../src/Scope";

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
        const store = new Store<IModel, IModel>(undefined);
        const scopeValue = Path.fromSelector<IModel, number>(f => f.scope.value);
        const stateValue = Path.fromSelector<IModel, string>(f => f.value);
        store.transformator = (instruction, is, transformer, state) => {
            if (is(scopeValue) && instruction.value !== undefined) {
                transformer.set(stateValue, instruction.value.toString());
            }
            transformer.applyInstruction();
        };
        const scope = new Scope(store, Path.fromSelector(f => f.scope), (instruction, is, transformer, state) => {
            if (is(Path.fromSelector(f => f.value)) && instruction.value !== undefined) {
                transformer.set(Path.fromSelector(f => f.scope.value), parseInt(instruction.value));
            }
            transformer.applyInstruction();
        });
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
        scope.instructor.set(Path.fromSelector(f => f.scope.value), 0);
        expect(scope.state.value).to.be.equal(0);
        expect(store.state.value).to.be.equal("0");
        expect(store.state).to.be.deep.equal(expectedState);

        store.instructor.set(Path.fromSelector(f => f.value), "1");
        expect(scope.state.value).to.be.equal(1);
        expect(store.state.value).to.be.equal("1");
        expect(store.state).to.be.deep.equal(expectedState1);
    });

});
