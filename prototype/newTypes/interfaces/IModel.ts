import { IGetCountainer, IMultipleCountainer, ISetCountainer } from "./ICountainer";

export interface IModel<T> extends ISetCountainer<T, T> {
}
export type MapModel<TModel> = {
    [P in keyof TModel]: TModel[P] extends Iterable<infer V>
    ? (IGetCountainer<any, V> & IMultipleCountainer<true>) | IGetCountainer<any, TModel[P]>
    : IGetCountainer<any, TModel[P]>;
};
