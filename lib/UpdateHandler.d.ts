import { IUpdateHandler } from "./interfaces";
export declare class UpdateHandler implements IUpdateHandler {
    private handlers;
    constructor();
    update(): void;
    subscribe(handler: () => void): void;
    unSubscribe(handler: () => void): void;
}
