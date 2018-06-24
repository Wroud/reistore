import { IStore } from "./interfaces/IStore";

export function* exchangeIterator<TValue, TResult>(
    iterator: IterableIterator<TValue>,
    action: (element: TValue) => IterableIterator<TResult>
) {
    for (const value of iterator) {
        yield* action(value);
    }
}

export function isStore<TState>(object): object is IStore<TState> {
    return "state" in object;
}
