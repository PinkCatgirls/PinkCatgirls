export = Member;
declare class Member extends Base {
    constructor(hub: any, data: any);
    get address(): any;
    get campaign(): any;
    get user(): any;
}
import Base = require("./Base");
