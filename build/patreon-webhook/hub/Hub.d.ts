export = Hub;
declare class Hub extends EventEmitter {
    constructor();
    addresses: Map<any, any>;
    campaigns: Map<any, any>;
    members: Map<any, any>;
    rewards: Map<any, any>;
    users: Map<any, any>;
    parse(data: any): any;
    parseApiResponse(req: any): any;
    webhooks(app: any, webhooecret: any): void;
}
import EventEmitter = require("events");
