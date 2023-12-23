export = Campaign;
declare class Campaign extends Base {
    constructor(hub: any, data: any);
    get creator(): any;
    get goals(): any;
    get rewards(): any;
}
import Base = require("./Base");
