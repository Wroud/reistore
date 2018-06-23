import { IStore } from "./interfaces/IStore";
export declare function exchangeIterator<TValue, TResult>(iterator: IterableIterator<TValue>, action: (element: TValue) => IterableIterator<TResult>): IterableIterator<TResult>;
export declare function isStore<TState>(object: any): object is IStore<TState>;
