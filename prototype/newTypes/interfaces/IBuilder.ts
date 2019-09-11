import { ICollectionCountainer, IComputedCountainer, IGetCountainer, ISetCountainer } from "./ICountainer";
import { IModel } from "./IModel";

type ModelInterface<T> = T extends IModel<infer P> ? P : never;
export interface IBuilder<TModel> {
    field<TValue>(defaultValue?: () => TValue): ISetCountainer<TModel, TValue>;
    array<TValue>(
        defaultValue?: () => TValue[]
    ): ICollectionCountainer<TModel, TValue[], never, number, TValue>;
    array<TDef extends IGetCountainer<any, any>>(
        def: new () => TDef,
        defaultValue?: () => Array<ModelInterface<TDef>>
    ): ICollectionCountainer<TModel, Array<ModelInterface<TDef>>, TDef, number, ModelInterface<TDef>>;
    map<TKey, TDef extends IGetCountainer<any, any> = never>(
        def: new () => TDef,
        defaultValue?: () => Map<TKey, ModelInterface<TDef>>
    ): ICollectionCountainer<TModel, Map<TKey, ModelInterface<TDef>>, TDef, TKey, ModelInterface<TDef>>;
    computed<TValue, TArgs extends any[]>(
        calc: (sub, current, ...args: TArgs) => TValue,
        defaultValue?: () => TValue
    ): IComputedCountainer<TModel, TValue, TArgs>;
    ref<TValue, TDef>(
        def: new () => TDef,
        ref?: (ref: TDef) => TValue
    ): TValue;
}
