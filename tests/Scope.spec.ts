import { expect } from "chai";
import "mocha";

import { Path, createStore, createScope, createSchema } from "../src/";

describe("Scope", () => {
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

    it("set", () => {
        const schema = createSchema<IModel>();
        const scope = createScope(schema, f => f.scope);
        const store = createStore<IModel>(schema);
        const expectedState = {
            scope: {
                array: [
                    {
                        number: 6
                    }
                ]
            }
        }
        store.set(Path.fromSelector(f => f.scope.array[0].number), 6);
        expect(scope.getState(store).array[0].number).to.be.equal(6);
        expect(scope.getState(store)).to.be.deep.equal(expectedState.scope);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("add", () => {
        const schema = createSchema<IModel>();
        const scope = createScope(schema, f => f.scope);
        const store = createStore<IModel>(schema);
        const expectedState = {
            scope: {
                array: [
                    {
                        number: 6
                    }, ,
                    {
                        number: 6
                    }
                ]
            }
        }
        store.add(Path.fromSelector(f => f.scope.array[0]), {
            number: 6
        });
        store.add(Path.fromSelector(f => f.scope.array[2]), {
            number: 6
        });
        expect(scope.getState(store).array[0].number).to.be.equal(6);
        expect(scope.getState(store).array[2].number).to.be.equal(6);
        expect(scope.getState(store)).to.be.deep.equal(expectedState.scope);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("remove", () => {
        const init = {
            scope: {
                array: [
                    {
                        number: 6
                    }
                ]
            }
        };
        const expectState = { scope: { array: [] } };
        const schema = createSchema<IModel>(init as IModel);
        const scope = createScope(schema, f => f.scope);
        const store = createStore<IModel>(schema);
        store.add(Path.fromSelector(f => f.scope.array[2]), {
            number: 6
        });
        store.remove(Path.fromSelector(f => f.scope.array), 0);
        expect(scope.getState(store).array.length).to.be.equal(1);
        store.remove(Path.fromSelector(f => f.scope.array), 0);
        expect(scope.getState(store).array.length).to.be.equal(0);
        expect(scope.getState(store)).to.be.deep.equal(expectState.scope);
        expect(store.state).to.be.deep.equal(expectState);
    });

    it("set number index to object", () => {
        const schema = createSchema<IModel>({ scope: { indexedArray: {} } } as IModel);
        const scope = createScope(schema, f => f.scope);
        const store = createStore<IModel>(schema);
        const expectedState = {
            scope: {
                indexedArray: {
                    0: {
                        number: 6
                    },
                    2: {
                        number: 6
                    }
                }
            }
        }
        store.set(Path.fromSelector(f => f.scope.indexedArray[0]), {
            number: 6
        });
        store.set(Path.fromSelector(f => f.scope.indexedArray[2]), {
            number: 6
        });
        expect(scope.getState(store).indexedArray[0].number).to.be.equal(6);
        expect(scope.getState(store).indexedArray[2].number).to.be.equal(6);
        expect(scope.getState(store)).to.be.deep.equal(expectedState.scope);
        expect(store.state).to.be.deep.equal(expectedState);
    });

});
