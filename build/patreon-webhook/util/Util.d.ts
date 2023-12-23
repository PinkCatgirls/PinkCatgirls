export = Util;
declare class Util {
    /**
     *
     * @param {any} x
     * @param {object} toClass
     * @returns {toClass}
     */
    static toClassIfExists(x: any, toClass: object): object;
    /**
     *
     * @param {string} str
     * @returns {string}
     */
    static upperFirst(str: string): string;
    static dateify(dateString: any): object;
    static isoify(date: any): any;
    static snakeToCamel(str: any): any;
    static patreonEventToCamel(str: any): any;
    static camelToSnake(str: any): any;
    static camelCaseObject(obj: any): {};
    static snakeCaseObject(obj: any): {};
    static resolvePlural(str: any): any;
    static verifyPatreonIdentity(req: any, secret: any): boolean;
}
