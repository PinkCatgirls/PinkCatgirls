export = PatreonAPIError;
declare class PatreonAPIError extends Error {
    static parse(apiObject: any): any;
    constructor(errorData: any);
    code: any;
    codeName: any;
    detail: any;
    id: any;
    status: any;
    title: any;
}
