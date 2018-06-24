export type Handler<TState> = (state: TState) => void
export interface IUpdateHandler<TState> {
    update(state: TState);
    subscribe(handler: Handler<TState>): this;
    unSubscribe(handler: Handler<TState>): this;
}
