
const data = {
    "data": [
        {
            "attributes": {
                "currently_entitled_amount_cents": 0,
                "full_name": "yogakl",
                "is_follower": false,
                "last_charge_date": "2023-10-27T06:18:06.000+00:00",
                "last_charge_status": "Refunded",
                "lifetime_support_cents": 0,
                "patron_status": "active_patron"
            },
            "id": "3b19487a-090b-489a-909f-3034aa7dcbdd",
            "relationships": {
                "currently_entitled_tiers": {
                    "data": [
                        {
                            "id": "21465771",
                            "type": "tier"
                        },
                        {
                            "id": "21436553",
                            "type": "tier"
                        }
                    ]
                },
                "user": {
                    "data": {
                        "id": "104940496",
                        "type": "user"
                    },
                    "links": {
                        "related": "https://www.patreon.com/api/oauth2/v2/user/104940496"
                    }
                }
            },
            "type": "member"
        },
        {
            "attributes": {
                "currently_entitled_amount_cents": 3900,
                "full_name": "Magic Sun",
                "is_follower": false,
                "last_charge_date": "2023-10-28T05:41:16.000+00:00",
                "last_charge_status": "Pending",
                "lifetime_support_cents": 0,
                "patron_status": "active_patron"
            },
            "id": "e4dd74e9-67e2-44ff-a137-11a54f94ae58",
            "relationships": {
                "currently_entitled_tiers": {
                    "data": [
                        {
                            "id": "21477969",
                            "type": "tier"
                        },
                        {
                            "id": "21465771",
                            "type": "tier"
                        },
                        {
                            "id": "21436553",
                            "type": "tier"
                        }
                    ]
                },
                "user": {
                    "data": {
                        "id": "95007712",
                        "type": "user"
                    },
                    "links": {
                        "related": "https://www.patreon.com/api/oauth2/v2/user/95007712"
                    }
                }
            },
            "type": "member"
        }
    ],
    "included": [
        {
            "attributes": {},
            "id": "104940496",
            "type": "user"
        },
        {
            "attributes": {},
            "id": "95007712",
            "type": "user"
        },
        {
            "attributes": {
                "amount_cents": 600,
                "discord_role_ids": null,
                "published": false,
                "title": "BRONZE"
            },
            "id": "21465771",
            "type": "tier"
        },
        {
            "attributes": {
                "amount_cents": 6900,
                "discord_role_ids": null,
                "published": true,
                "title": "SILVER"
            },
            "id": "21436553",
            "type": "tier"
        },
        {
            "attributes": {
                "amount_cents": 3900,
                "discord_role_ids": null,
                "published": true,
                "title": "BRONZE"
            },
            "id": "21477969",
            "type": "tier"
        }
    ],
    "meta": {
        "pagination": {
            "cursors": {
                "next": null
            },
            "total": 2
        }
    }
}



function parse() {
    const memberList = data.data;
    if(Array.isArray(memberList)) {
        for(const member of memberList) {
            console.log(member);
            const chargeStatus = member.attributes.last_charge_status;
            const currently_entitled_tiers = member.attributes.currently_entitled_amount_cents;
            if(chargeStatus === "Paid" || chargeStatus === "Pending") {

            }
        }
    }
}

parse();