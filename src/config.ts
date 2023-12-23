const config = {
  dev: {
    database: {
      dbName: "pink_cat_girls",
      host: "127.0.0.1",
      // port: 3306,
      user: "root",
      password: "nameLR9969!",
    },
    API_URL: process.env.API_URL,
    BOT_API_KEY: process.env.BOT_API_KEY,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_SECRET: process.env.PAYPAL_SECRET,
    NOW_PAYMENT_KEY: process.env.NOW_PAYMENT_API_KEY
  },

  prod: {
    database: {
      dbName: "pink_cat_girls",
      host: "127.0.0.1",
      // port: 3306,
      user: "root",
      password: "nameLR9969!",
    },
    API_URL: process.env.API_URL,
    BOT_API_KEY: process.env.BOT_API_KEY,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_SECRET: process.env.PAYPAL_SECRET,
    NOW_PAYMENT_KEY: process.env.NOW_PAYMENT_API_KEY
  },
};

const env = process.env.NODE_ENV || "dev";

const ATTRIBUTE = {
  hair: {
    description: "Change hair style and color",
    empty_desc:
      "Type prompt for hair (color and style), e.g. /hair black straight long",
    inline_keyboard: [
      [
        {
          text: "/hair black straight long",
          // callback_data: "attribute_hair_black straight long",
        },
      ],
      [
        {
          text: "/hair blonde curly long",
          // callback_data: "attribute_hair_blonde curly long",
        },
      ],
      [
        {
          text: "/hair red straight short",
          // callback_data: "attribute_hair_red straight short",
        },
      ],
      [
        {
          text: "/hair pink curly short",
          // callback_data: "attribute_hair_pink curly short",
        },
      ],
      [
        {
          text: "/hair rose gold emo",
          // callback_data: "attribute_hair_rose gold emo",
        },
      ],
      [
        {
          text: "/hair blue pixie",
          // callback_data: "attribute_hair_blue pixie",
        },
      ],
    ],
  },
  chest: {
    description: "Change chest size",
    empty_desc: "Type prompt for chest  (size), e.g. /chest big",
    inline_keyboard: [
      [
        {
          text: "/chest small breast",
          callback_data: "attribute_chest_small breast",
        },
      ],
      [
        {
          text: "/chest medium breast",
          callback_data: "attribute_chest_medium breast",
        },
      ],
      [
        {
          text: "/chest large breast",
          callback_data: "attribute_chest_large breast",
        },
      ],
      [
        {
          text: "/chest huge breast",
          callback_data: "attribute_chest_huge breast",
        },
      ],
      [
        {
          text: "/chest small silicone",
          callback_data: "attribute_chest_small silicone",
        },
      ],
      [
        {
          text: "/chest big silicone",
          callback_data: "attribute_chest_big silicone",
        },
      ],
    ],
  },
  body: {
    description: "Change body style",
    empty_desc: "Type prompt for body (style), e.g. /body petite",
    inline_keyboard: [
      [{ text: "/body very thin", callback_data: "attribute_body_very thin" }],
      [{ text: "/body thin", callback_data: "attribute_body_thin" }],
      [{ text: "/body average", callback_data: "attribute_body_average" }],
      [{ text: "/body athletic", callback_data: "attribute_body_athletic" }],
      [{ text: "/body fit", callback_data: "attribute_body_fit" }],
      [{ text: "/body curvy", callback_data: "attribute_body_curvy" }],
    ],
  },
  clothes: {
    description: "Change clothes",
    empty_desc:
      "Type prompt for clothes, e.g. /clothes top t-shirt, bottom leggings, high heels",
    inline_keyboard: [
      [
        {
          text: "/clothes fishnet",
          callback_data: "attribute_clothes_fishnet",
        },
      ],
      [
        {
          text: "/clothes cheong sam",
          callback_data: "attribute_clothes_cheong sam",
        },
      ],
      [
        {
          text: "/clothes mesh night dress",
          callback_data: "attribute_clothes_mesh night dress",
        },
      ],
      [
        {
          text: "/clothes nurse costumes",
          callback_data: "attribute_clothes_nurse costumes",
        },
      ],
      [{ text: "/clothes bikini", callback_data: "attribute_clothes_bikini" }],
      [
        {
          text: "/clothes yoga pants",
          callback_data: "attribute_clothes_yoga pants",
        },
      ],
      [
        {
          text: "/clothes transparent clothing",
          callback_data: "attribute_clothes_transparent clothing",
        },
      ],
      [
        {
          text: "/clothes no clothes",
          callback_data: "attribute_clothes_naked",
        },
      ],
    ],
  },
  pose: {
    description: "Change pose",
    empty_desc: "Type prompt for pose, e.g. /pose standing, crossed arms",
    lora_keywords: [
      "show only tops",
      "show ass",
      "titfuck",
      "missionary",
      "bukkake",
      "pant pull down",
      "repair vagina",
      "undressing",
      "semen",
      "modern victorian fashion dress",
      "cute girl",
      "special clothes",
    ],
    inline_keyboard: [
      [
        {
          text: "/pose standing, crossed legs and biting lips",
          callback_data: "attribute_pose_cross legs and bite lip",
        },
      ],
      [
        {
          text: "/pose lying down, spread apart legs",
          callback_data: "attribute_pose_lift and spread legs",
        },
      ],
      [
        {
          text: "/pose lift shirt",
          callback_data: "attribute_pose_show only tops",
        },
      ],
      [
        {
          text: "/pose standing and pant pull down",
          callback_data: "attribute_pose_pant pull down",
        },
      ],
    ],
  },
  background: {
    description: "Change background",
    empty_desc: "Type prompt for background, e.g. /background rooftop",
    inline_keyboard: [
      [
        {
          text: "/background street",
          callback_data: "attribute_background_street",
        },
      ],
      [
        {
          text: "/background bathroom",
          callback_data: "attribute_background_bathroom",
        },
      ],
      [
        {
          text: "/background shopping mall",
          callback_data: "attribute_background_shopping mall",
        },
      ],
      [
        {
          text: "/background library",
          callback_data: "attribute_background_library",
        },
      ],
      [
        {
          text: "/background amusement park",
          callback_data: "attribute_background_amusement park",
        },
      ],
      [
        {
          text: "/background fitness center",
          callback_data: "attribute_background_fitness center",
        },
      ],
    ],
  },
};

const LORA_KEYWORDS = {
  "10019:0.4": ["cum string", "ejaculation", "cum on face", "cumshot"],
  7701: ["titfuck"],
  "31385:1.5": ["missionary"],
  "11126:1.5": ["pantpulldown", "pant pull down"],
  10364: ["vulva", "genitalia"],
  8179: [
    "hands on own ass",
    "hands on ass",
    "grabbing own ass",
    "ass stretch",
    "ass spread",
  ],
  16722: ["bukkake"],
  "6693:1.5": ["lift shirt"],
  42214: ["undress", "clothes off"],
  "106996:0.4": ["peeing", "pee"],
  144950: ["spread pussy"],
  152877: ["transparent clothing", "transparent dress"],
};

const ATTRIBUTE_COMMAND = Object.keys(ATTRIBUTE).map((key) => ({
  command: key,
  description: ATTRIBUTE[key as keyof typeof ATTRIBUTE].description,
}));

//@ts-ignore
const database = config[env].database;
//@ts-ignore
const BOT_API_KEY = config[env].BOT_API_KEY;

const getLoraId = (str: string): string => {
  if (!str) {
    return "0";
  }
  for (let [key, value] of Object.entries(LORA_KEYWORDS)) {
    for (let v of value) {
      if (str.match(v)) {
        return key;
      }
    }
  }

  return "0";
};

const patreon_config = {
  client_id: process.env.PATREON_CLIENT_ID,
  client_secret: process.env.PATREON_CLIENT_SECRET,
};

//@ts-ignore
const PAYPAL_CLIENT_ID = config[env].PAYPAL_CLIENT_ID;
//@ts-ignore
const PAYPAL_SECRET = config[env].PAYPAL_SECRET;

// @ts-ignore
const NOW_PAYMENT_KEY = config[env].NOW_PAYMENT_KEY
// @ts-ignore
const API_URL = config[env].API_URL

const BASE_CONTROLLER_URL =
  env === "prod" ? "https://api.catgirls.pink" : "http://localhost:3000";
const BASE_URL = process.env.BASE_URL
export {
  database,
  ATTRIBUTE,
  ATTRIBUTE_COMMAND,
  BOT_API_KEY,
  LORA_KEYWORDS,
  API_URL,
  getLoraId,
  BASE_URL,
  patreon_config,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  NOW_PAYMENT_KEY,
  BASE_CONTROLLER_URL,
  env,
};
