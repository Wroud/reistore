export const PathNode = Symbol("@@node");

export interface ICountainer<T> {
    [PathNode]: T;
}
