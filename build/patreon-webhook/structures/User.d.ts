export = User;
declare class User extends Base {
    constructor(hub: any, data: any);
    get campaign(): any;
}
import Base = require("./Base");
