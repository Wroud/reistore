export interface IUpdateHandler {
    update();
    subscribe(handler: () => void);
    unSubscribe(handler: () => void);
}
