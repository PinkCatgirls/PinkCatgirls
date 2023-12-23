declare function parse(): void;
declare namespace data {
    const data: {
        attributes: {
            currently_entitled_amount_cents: number;
            full_name: string;
            is_follower: boolean;
            last_charge_date: string;
            last_charge_status: string;
            lifetime_support_cents: number;
            patron_status: string;
        };
        id: string;
        relationships: {
            currently_entitled_tiers: {
                data: {
                    id: string;
                    type: string;
                }[];
            };
            user: {
                data: {
                    id: string;
                    type: string;
                };
                links: {
                    related: string;
                };
            };
        };
        type: string;
    }[];
    const included: ({
        attributes: {
            amount_cents?: undefined;
            discord_role_ids?: undefined;
            published?: undefined;
            title?: undefined;
        };
        id: string;
        type: string;
    } | {
        attributes: {
            amount_cents: number;
            discord_role_ids: null;
            published: boolean;
            title: string;
        };
        id: string;
        type: string;
    })[];
    namespace meta {
        namespace pagination {
            namespace cursors {
                const next: null;
            }
            const total: number;
        }
    }
}
