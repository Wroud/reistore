export function isMap<TKey, TValue>(object): object is Map<TKey, TValue> {
    return object instanceof Map;
}
