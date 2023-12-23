export = Base;
declare class Base {
    static resolveApiEndpoint(type: any): string;
    static resolveClass(hub: any, data: any): any;
    constructor(hub: any, data: any, parseHandlers?: {});
    attributes: {};
    get link(): string;
    parse(data: any): Base;
    partial: boolean | undefined;
    id: any;
    type: any;
    toJSON(): {
        id: any;
        type: any;
        attributes: {};
        relationships: {};
    };
    fetch(cache?: boolean): Promise<any>;
}
