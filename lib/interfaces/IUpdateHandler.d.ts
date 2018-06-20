export interface IUpdateHandler {
    update(): any;
    subscribe(handler: () => void): any;
    unSubscribe(handler: () => void): any;
}
