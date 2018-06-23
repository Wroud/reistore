import { expect } from "chai";
import "mocha";

import { Path } from "../src/Path";
import { Store } from "../src/Store";
import { Scope } from "../src/Scope";
import { StoreSchema } from "../src/StoreSchema";

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
        const schema = new Scope(new StoreSchema<IModel, IModel>(), Path.fromSelector(f => f.scope));
        const store = new Store(schema.store);
        const expectedState = {
            scope: {
                array: [
                    {
                        number: 6
                    }
                ]
            }
        }
        store.instructor.set(Path.fromSelector(f => f.scope.array[0].number), 6);
        expect(store.state.scope.array[0].number).to.be.equal(6);
        expect(schema.getState(store.state)).to.be.deep.equal(expectedState.scope);
        expect(store.state).to.be.deep.equal(expectedState);
    });

    it("add", () => {
        const schema = new Scope(new StoreSchema<IModel, IModel>(), Path.fromSelector(f => f.scope));
        const store = new Store(schema.store);
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
        store.instructor.add(Path.fromSelector(f => f.scope.array[0]), {
            number: 6
        });
        store.instructor.add(Path.fromSelector(f => f.scope.array[2]), {
            number: 6
        });
        expect(store.state.scope.array[0].number).to.be.equal(6);
        expect(store.state.scope.array[2].number).to.be.equal(6);
        expect(store.state.scope).to.be.deep.equal(expectedState.scope);
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
        const schema = new Scope(new StoreSchema<IModel, IModel>(), Path.fromSelector(f => f.scope));
        const store = new Store(schema.store, init as IModel);
        store.instructor.add(Path.fromSelector(f => f.scope.array[2]), {
            number: 6
        });
        store.instructor.remove(Path.fromSelector(f => f.scope.array), [], 0);
        expect(store.state.scope.array.length).to.be.equal(1);
        store.instructor.remove(Path.fromSelector(f => f.scope.array), [], 0);
        expect(store.state.scope.array.length).to.be.equal(0);
        expect(store.state.scope).to.be.deep.equal(expectState.scope);
        expect(store.state).to.be.deep.equal(expectState);
    });

    it("set number index to object", () => {
        const schema = new Scope(new StoreSchema<IModel, IModel>(), Path.fromSelector(f => f.scope));
        const store = new Store(schema.store, { scope: { indexedArray: {} } } as IModel);
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
        store.instructor.set(Path.fromSelector(f => f.scope.indexedArray[0]), {
            number: 6
        });
        store.instructor.set(Path.fromSelector(f => f.scope.indexedArray[2]), {
            number: 6
        });
        expect(store.state.scope.indexedArray[0].number).to.be.equal(6);
        expect(store.state.scope.indexedArray[2].number).to.be.equal(6);
        expect(store.state.scope).to.be.deep.equal(expectedState.scope);
        expect(store.state).to.be.deep.equal(expectedState);
    });

});
