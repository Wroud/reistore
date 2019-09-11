import { IStore } from "../IStore";
import { IGetNodeAccessor, ISetNodeAccessor, MultipleValue } from "../node";

export interface ISubscriber<TRoot> {
    store: IStore<TRoot>;
    get<TValue, TMultiple extends boolean>(
        node: IGetNodeAccessor<any, TRoot, TRoot | ISubscriber<TRoot>, TValue, TMultiple> | ISetNodeAccessor<any, TRoot, TRoot | ISubscriber<TRoot>, TValue, TMultiple>,
        strict?: boolean
    ): MultipleValue<TValue, TMultiple>;
    unSubscribeAll();
}
