export function* exchangeIterator<TValue, TResult>(iterator: IterableIterator<TValue>, action: (element: TValue) => IterableIterator<TResult>) {
    for (const value of iterator) {
        yield* action(value);
    }
}
