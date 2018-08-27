import { IStore } from "./interfaces/IStore";
import { Store } from "./Store";

export function* exchangeIterator<TValue, TResult>(
    iterator: IterableIterator<TValue>,
    action: (element: TValue) => IterableIterator<TResult>
) {
    for (const value of iterator) {
        yield* action(value);
    }
}

export function isStore<TState extends object | any[] | Map<any, any>>(object): object is IStore<TState> {
    return object instanceof Store;
}
