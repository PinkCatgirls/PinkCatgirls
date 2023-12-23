declare const env: string;
declare const ATTRIBUTE: {
    hair: {
        description: string;
        empty_desc: string;
        inline_keyboard: {
            text: string;
        }[][];
    };
    chest: {
        description: string;
        empty_desc: string;
        inline_keyboard: {
            text: string;
            callback_data: string;
        }[][];
    };
    body: {
        description: string;
        empty_desc: string;
        inline_keyboard: {
            text: string;
            callback_data: string;
        }[][];
    };
    clothes: {
        description: string;
        empty_desc: string;
        inline_keyboard: {
            text: string;
            callback_data: string;
        }[][];
    };
    pose: {
        description: string;
        empty_desc: string;
        lora_keywords: string[];
        inline_keyboard: {
            text: string;
            callback_data: string;
        }[][];
    };
    background: {
        description: string;
        empty_desc: string;
        inline_keyboard: {
            text: string;
            callback_data: string;
        }[][];
    };
};
declare const LORA_KEYWORDS: {
    "10019:0.4": string[];
    7701: string[];
    "31385:1.5": string[];
    "11126:1.5": string[];
    10364: string[];
    8179: string[];
    16722: string[];
    "6693:1.5": string[];
    42214: string[];
    "106996:0.4": string[];
    144950: string[];
    152877: string[];
};
declare const ATTRIBUTE_COMMAND: {
    command: string;
    description: string;
}[];
declare const database: any;
declare const BOT_API_KEY: any;
declare const getLoraId: (str: string) => string;
declare const patreon_config: {
    client_id: string;
    client_secret: string;
};
declare const PAYPAL_CLIENT_ID: any;
declare const PAYPAL_SECRET: any;
declare const BASE_CONTROLLER_URL: string;
export { database, ATTRIBUTE, ATTRIBUTE_COMMAND, BOT_API_KEY, LORA_KEYWORDS, getLoraId, patreon_config, PAYPAL_CLIENT_ID, PAYPAL_SECRET, BASE_CONTROLLER_URL, env, };
