import { IStore } from "./interfaces/IStore";
export declare function exchangeIterator<TValue, TResult>(iterator: IterableIterator<TValue>, action: (element: TValue) => IterableIterator<TResult>): IterableIterator<TResult>;
export declare function isStore<TState extends object | any[] | Map<any, any>>(object: any): object is IStore<TState>;
