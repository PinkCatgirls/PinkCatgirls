'use strict';
const Base = require('../structures/Base');
const Util = require('../util/Util');
const EventEmitter = require('events');
const PatreonAPIError = require('../structures/PatreonAPIError');

class Hub extends EventEmitter {
    constructor() {
        super();
        this.addresses = new Map();
        this.campaigns = new Map();
        this.members = new Map();
        this.rewards = new Map();
        this.users = new Map();
    }

    parse(data) {
        const thisProp = Util.resolvePlural(data.type);

        if (this[thisProp]) {
            const existing = this[thisProp].get(data.id);
            if (existing) return existing.parse(data);

            this[thisProp].set(data.id, Base.resolveClass(this, data));
            return this[thisProp].get(data.id);
        }

        return Base.resolveClass(this, data);
    }

    parseApiResponse(req) {
        if (req.errors) {
            const errors = PatreonAPIError.parse(req);
            errors.forEach(e => console.error(e));
            return undefined;
        }
        const mainData = req.data;
        if (!mainData) return;
        const extra = req.included;
        if (extra) extra.forEach(x => this.parse(x));
        return this.parse(mainData);
    }

    webhooks(app, webhooecret) {

        app.post('/webhook/patreon', (req, res, next) => {
            const eventName = req.headers['x-patreon-event'];
            // const isFromPatreon = Util.verifyPatreonIdentity(req, webhookSecret);
            // if (!isFromPatreon) return res.status(401).end();
            if (!eventName) return res.status(400).end();
            const data = req.body
            const parsed = this.parseApiResponse(data);
            if (!parsed) return res.status(400).end();

            const event = Util.patreonEventToCamel(eventName);
            this.emit('all', parsed, event);
            this.emit(event, parsed);
            res.status(200).end("ok")
        });
    }
}

module.exports = Hub;
