import axios from "axios";
import * as fs from "fs";
import * as TelegramBot from "node-telegram-bot-api";
import { getImage } from "./get-images";
import * as sharp from "sharp";
import User, { IUser } from "./db/user";
import { ATTRIBUTE, ATTRIBUTE_COMMAND, BASE_URL, BOT_API_KEY, getLoraId } from "./config";
import Payment from "./payment";
import Decimal from "decimal.js";
import ShareService from "./service/ShareService";
import logger from "./log";
import PatreonService from "./service/PatreonService";
import CommandRecord from "./db/command_record";
import payPalSerivce from "./service/PayPalService";

export type GENERATE_ATTRIBUTE =
  | "hair"
  | "pose"
  | "body"
  | "chest"
  | "clothes"
  | "background";

const COMBO_PACKAEG = new Map();
COMBO_PACKAEG.set("combo_1", {
  text: "20 Credits - $6",
  money: 6,
  credits: 20,
});
COMBO_PACKAEG.set("combo_2", {
  text: "50 Credits - $14(7% off)",
  money: 14,
  credits: 50,
});
COMBO_PACKAEG.set("combo_3", {
  text: "100 Credits - $27(10% off)",
  money: 27,
  credits: 100,
});
COMBO_PACKAEG.set("combo_4", {
  text: "200 Credits - $50(17% 0ff)",
  money: 50,
  credits: 200,
});
COMBO_PACKAEG.set("combo_5", {
  text: "500 Credits - $115(23% off)",
  money: 115,
  credits: 500,
});
COMBO_PACKAEG.set("combo_6", {
  text: "1000 Credits - $200(33% 0ff)",
  money: 200,
  credits: 1000,
});

const refill_package = new Array<Array<TelegramBot.InlineKeyboardButton>>();

for (let [key, value] of COMBO_PACKAEG) {
  refill_package.push([{ text: value.text, callback_data: key }]);
}

const payTypeInlineKeybord = (binded?: boolean) => [
  [{ text: "🪙 Crypoto", callback_data: "payType_crypoto" }],
  binded
    ? [
        {
          text: "💳 Cards (Patreon.com)",
          url: "https://www.patreon.com/PinkCatgirls/membership",
        },
      ]
    : [{ text: "💳 Cards(Patreon.com)", callback_data: "payType_patreon" }],
  [{ text: "💳 PayPal", callback_data: "payType_payPal" }],
];

export default class Telegram {
  public bot = new TelegramBot(BOT_API_KEY, {
    polling: true,
  });

  public shareService = new ShareService();

  private orders: {
    [chatId: number]: {
      state: 1 | 2 | 3;
      chatId: number;
      // user: IUser;
      image?: string;
      generateParams?: {
        [key in GENERATE_ATTRIBUTE | "loraId"]?: string | null;
      };
    };
  } = {};

  async setup() {
    this.bot.setMyCommands([
      { command: "start", description: "Start a new photo enhancement cycle" },

      ...ATTRIBUTE_COMMAND,

      {
        command: "generate",
        description: "Generate photo based on parameters",
      },
      { command: "refill", description: "Buy more credits" },
      { command: "profile", description: "Display your ID and Credits" },
      { command: "invite", description: "Invite friends to earn credits" },
      {
        command: "support",
        description: "Display information for contacting support",
      },
    ]);

    this.bot.onText(/^\/start(|\s+.*)$/, (msg) => this.start(msg));
    this.bot.onText(/^\/refill(|\s+.*)$/, (msg) => this.refill(msg));
    this.bot.onText(/^\/support(|\s+.*)$/, (msg) =>
      this.bot.sendMessage(msg.chat.id, " @PinkCatgirls01")
    );
    this.bot.onText(/^\/invite(|\s+.*)$/, (msg) => this.invite(msg));

    // set attribute
    this.bot.onText(/^\/hair(|\s+.*)$/, (msg, match) =>
      this.setGenerateAttr(
        msg,
        "hair",
        match?.[1]?.trim()?.toLocaleLowerCase() || ""
      )
    );
    this.bot.onText(/^\/pose(|\s+.*)$/, (msg, match) =>
      this.setGenerateAttr(
        msg,
        "pose",
        match?.[1]?.trim()?.toLocaleLowerCase() || ""
      )
    );
    this.bot.onText(/^\/body(|\s+.*)$/, (msg, match) =>
      this.setGenerateAttr(
        msg,
        "body",
        match?.[1]?.trim()?.toLocaleLowerCase() || ""
      )
    );
    this.bot.onText(/^\/chest(|\s+.*)$/, (msg, match) =>
      this.setGenerateAttr(
        msg,
        "chest",
        match?.[1]?.trim()?.toLocaleLowerCase() || ""
      )
    );
    this.bot.onText(/^\/clothes(|\s+.*)$/, (msg, match) =>
      this.setGenerateAttr(
        msg,
        "clothes",
        match?.[1]?.trim()?.toLocaleLowerCase() || ""
      )
    );
    this.bot.onText(/^\/background(|\s+.*)$/, (msg, match) =>
      this.setGenerateAttr(
        msg,
        "background",
        match?.[1]?.trim()?.toLocaleLowerCase() || ""
      )
    );

    this.bot.onText(/^\/generate(|\s+.*)$/, (msg) => this.generate(msg));

    this.bot.onText(/^\/profile(|\s+.*)$/, (msg) => this.profile(msg));

    this.bot.on("message", (msg, metadata) => {
      switch (metadata.type) {
        case "photo":
          this.uploadImage(msg);
          break;
        default:
      }
    });

    this.bot.on("callback_query", (query) => this.callbackQuery(query));
  }

  //按钮回调
  async callbackQuery(query: TelegramBot.CallbackQuery) {
    const { data, message } = query;
    if (!message || !data) {
      return;
    }

    if (data.indexOf("combo#") > -1) {
      const [, type, combo] = data.split("#");
      await this.comboCallbackQuery(combo, message, type);
    } else if (data?.indexOf("payed_") > -1) {
      const combo = COMBO_PACKAEG.get(data.replace("payed_", ""));
      const user = await User.getUser(message.chat.id);
      const rest = user.credits + combo.credits;
      await User.update({ credits: rest }, { where: { id: user.id } });
      this.bot.sendMessage(
        message.chat.id,
        `You've received ${combo.credits} credits. \nYour new balance is ${rest} credits.`
      );
    } else if (data.indexOf("attribute_") > -1) {
      await this.attributeCallbackQuery(data, message);
    } else if (data.indexOf("payType_") > -1) {
      await this.payTypeHandle(data, message);
    }
  }

  //crypoto套餐按钮点击回调处理
  async comboCallbackQuery(
    data: string,
    message: TelegramBot.Message,
    type: string
  ) {
    const combo = COMBO_PACKAEG.get(data);

    if (!this.orders[message.chat.id]) {
      await this.bot.sendMessage(
        message.chat.id,
        "Try again with the /start command first"
      );
      return;
    }

    try {
      const user = await User.getUser(message.chat.id);

      let order: any = null;
      if (type === "crypoto") {
        order = await new Payment(
          user,
          new Decimal(combo.money),
          combo.credits,
          combo.text
        ).createInvoice();
      }
      if (type === "payPal") {
        order = await payPalSerivce.createOrder(
          user.id,
          combo.money,
          combo.credits,
          combo.text
        );
      }

      if (!order) {
        throw new Error();
      }
      await this.bot.sendMessage(
        message.chat.id,
        "Please wait, creating order..."
      );
      await this.bot.sendMessage(message?.chat.id, `Invoice Id: ${order.id}`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `👉 Pay ${combo.money} USD `,
                url: order.invoice_url,
                pay: true,
              },
            ],
          ],
        },
      });
    } catch (error) {
      logger.error(error);
      await this.bot.sendMessage(
        message.chat.id,
        "Something error, pls try again"
      );
    }
  }

  //属性按钮点击回调处理
  async attributeCallbackQuery(data: string, message: TelegramBot.Message) {
    const [, attr, value] = data.split("_") as [
      string,
      GENERATE_ATTRIBUTE,
      string
    ];
    await this.setGenerateAttr(message, attr, value);
  }

  //支付方式选择按钮回调
  async payTypeHandle(data: string, message: TelegramBot.Message) {
    const [_, type] = data.split("_");
    const user = await User.getUser(message.chat.id);

    //日志记录
    await CommandRecord.create({
      command_name: type,
      user_id: message.chat.id,
    });

    if (type === "crypoto" || type === "payPal") {
      await this.bot.editMessageReplyMarkup(
        {
          inline_keyboard: [
            ...refill_package.map((o: any) => [
              {
                text: o[0].text,
                callback_data: `combo#${type}#` + o[0].callback_data,
              },
            ]),
            [{ text: "Back", callback_data: "payType_back" }],
          ],
        },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    } else if (type === "patreon") {
      if (!user.patreon_id) {
        //如果没有绑定 ，需要先绑定patreon
        await this.bot.sendMessage(
          message.chat.id,
          "You haven't linked your Patreon account yet.\nYou'll need to link it before you can buy credits.",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Link Patreon Account",
                    url: PatreonService.createLink(user.id),
                  },
                ],
              ],
            },
          }
        );
        return;
      }

      // await this.bot.sendMessage(message.chat.id, "coming soon");
    } else if (type === "back") {
      await this.bot.editMessageReplyMarkup(
        {
          inline_keyboard: payTypeInlineKeybord(user.patreon_id ? true : false),
        },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
  }

  async start(msg: TelegramBot.Message) {
    if (!msg.from || !msg.text) {
      return;
    }
    const chatId = msg.chat.id;

    delete this.orders[chatId];

    const user = await User.insertData(msg.from);

    this.orders[chatId] = {
      state: 1,
      chatId,
    };

    const [_, shareCode] = msg.text?.split(" ");

    logger.info("%s start shareCode: %s", chatId, shareCode);

    //判断是否是通过分享进来的
    if (shareCode) {
      await this.shareService.clickShreLinkRecord(shareCode, user.id);
    }

    await this.bot.sendMessage(
      chatId,
      `Welcome to PinkCatgirls.\n\nBy continuing to use our services, you agree to abide by the <a href="${BASE_URL}/Terms_Of_Service.pdf">Terms Of Service</a> and <a href="${BASE_URL}/Privacy_Policy.pdf">Privacy Policy</a> and confirm that you are over 18 years old.`,
      { parse_mode: "HTML" }
    );

    await this.bot.sendMessage(
      chatId,
      "Upload your photo (including one character) to start enhancing. Enjoy it!"
    );
  }

  async invite(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    if (!msg.from) {
      return;
    }
    if (!this.orders[chatId]) {
      this.orders[chatId] = {
        state: 1,
        chatId,
      };
    }
    const user = await User.insertData(msg.from);
    const shareLink = this.shareService.createShareLink(user.id);
    await this.bot.sendMessage(
      chatId,
      `You can earn credits by sharing the link:\n<a href="${shareLink}">${shareLink}</a>\n\nShare this link with your friends\n1. Get 1 credit when your friend uses it\n2. Get 50% of the credits from your friend’s first purchase.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "👉 Share the link",
                url: "https://t.me/share/url?url=" + shareLink,
              },
            ],
          ],
        },
        parse_mode: "HTML",
      }
    );
  }

  async refill(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    if (!msg.from) {
      return;
    }
    try {
      if (!this.orders[chatId]) {
        this.orders[chatId] = {
          state: 1,
          chatId,
        };
      }

      //日志记录
      await CommandRecord.create({ command_name: "/refill", user_id: chatId });

      const user = await User.getUser(chatId);

      await this.bot.sendMessage(
        chatId,
        "Choose a provider.\nMore options coming soon.",
        {
          reply_markup: {
            inline_keyboard: payTypeInlineKeybord(
              user.patreon_id ? true : false
            ),
          },
        }
      );
    } catch (error) {
      logger.error(error);
      await this.bot.sendMessage(
        chatId,
        `Upload failed\nTry again with the /start command first`
      );
    }
  }

  async uploadImage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    if (!msg.from) {
      return;
    }
    try {
      if (!this.orders[chatId]) {
        this.orders[chatId] = {
          state: 1,
          chatId,
        };
      }

      logger.info(chatId, "upload image", msg.photo);

      const fileId = msg.photo!.pop()!.file_id!;
      const fileLink = await this.bot.getFileLink(fileId);

      logger.info(chatId, fileLink);

      const fileRes = await axios.get(fileLink, {
        responseType: "arraybuffer",
      });

      const base64 = Buffer.from(fileRes.data, "binary").toString("base64");

      this.orders[chatId].image = base64;

      await this.bot.sendMessage(
        chatId,
        `Upload Success\nWe support attributes: hair, pose, body, chest, clothes, background\nSet attributes with type:\n/hair red\nAnd type /generate to generate`
      );

      this.orders[chatId].state = 2;
    } catch (e) {
      await this.bot.sendMessage(
        chatId,
        `Upload failed\nTry again with the /start command first`
      );
    }
  }

  async profile(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    if (!this.orders[chatId]) {
      this.orders[chatId] = {
        state: 1,
        chatId,
      };
    }
    const user = await User.getUser(chatId);
    await this.bot.sendMessage(
      chatId,
      `ID: ${user?.id}\nCredits: ${user?.credits}`
    );
  }

  async setGenerateAttr(
    msg: TelegramBot.Message,
    attr: GENERATE_ATTRIBUTE,
    value: string
  ) {
    const chatId = msg.chat.id;

    try {
      if (this.orders[chatId]?.state !== 2) {
        await this.bot.sendMessage(chatId, "Upload your photo first");
        return;
      }

      if (!value) {
        const attrObj = ATTRIBUTE[attr];
        if (attrObj?.inline_keyboard) {
          await this.bot.sendMessage(chatId, attrObj.empty_desc, {
            reply_markup: {
              keyboard: attrObj.inline_keyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
        } else {
          await this.bot.sendMessage(
            chatId,
            `Please type /${attr} your promote`
          );
        }
        return;
      }

      if (!this.orders[chatId].generateParams)
        this.orders[chatId].generateParams = {};
      this.orders[chatId].generateParams![attr] = value;
      const loraId = getLoraId(value);
      this.orders[chatId].generateParams!["loraId"] = loraId ? loraId : null;

      logger.info(
        "set generate attribute %s=%s, loraId:%s",
        attr,
        value,
        loraId
      );

      await this.bot.sendMessage(
        chatId,
        `Set attribute ${attr} success: ${value}`
      );
    } catch (e) {
      await this.bot.sendMessage(
        chatId,
        `Set attribute ${attr} failed\nTry again with the /start command first`
      );
    }
  }

  async generate(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    if (!this.orders[chatId]) {
      await this.bot.sendMessage(chatId, "Please type /start command first");
      return;
    }
    if (this.orders[chatId].state !== 2) {
      await this.bot.sendMessage(chatId, "Upload your photo first");
      return;
    }

    const user = await User.getUser(chatId);

    if (user.credits <= 0) {
      await this.bot.sendMessage(
        chatId,
        `Oops! It seems like your credits have run out.\n1.Type /refill to buy credits.\n2.Type /invite, invite friends to earn credits`
      );

      return;
    }

    //扣费

    const pre = user.credits;
    const rest = user.credits - 1;
    await User.update({ credits: rest }, { where: { id: user.id } });
    await this.bot.sendMessage(
      chatId,
      `Please wait for 1-2 minutes, costs 1 credit per generate, you have ${rest} credits left.`
    );
    try {
      // this.bot.sendMessage(chatId, `You have ${rest} credits left.`);

      fs.writeFileSync("./images/image.txt", this.orders[chatId].image!);

      const postData = {
        params: {
          hair: "",
          pose: "",
          body: "thin",
          chest: "",
          clothes: "no clothes",
          background: "",
          number: 1,
          ...(this.orders[chatId].generateParams || {}),
        },
        image: this.orders[chatId].image,
      };

      logger.info(
        "request bot api post data: %s",
        JSON.stringify(postData.params)
      );

      const { data } = await axios.post(
        "https://api.crazyhorse.ai/v1/generations",
        postData,
        {
          headers: {
            "api-key": "18c0bf5b8630efe66a5b6f914d381c26",
          },
        }
      );
      const code = data?.data?.code;
      if (code) {
        const watchCode = setInterval(async () => {
          const { data } = await axios.get(
            `https://api.crazyhorse.ai/v1/generations/${code}`,
            {
              headers: {
                "api-key": "18c0bf5b8630efe66a5b6f914d381c26",
              },
            }
          );
          const res = data?.data;
          if (res.state === "DONE" && res.generateImageUrls?.length) {
            clearInterval(watchCode);
            for (const image of res.generateImageUrls) {
              logger.info(
                "bot api response image",
                `https://pic.crazyhorse.ai/${image}`
              );
              const imageBase64 = await getImage(
                `https://pic.crazyhorse.ai/${image}`
              );
              sharp(imageBase64)
                .jpeg({ quality: 60 })
                .toBuffer()
                .then(async (data) => {
                  // Gửi ảnh đã xử lý
                  await this.bot.sendPhoto(chatId, data); // 1 image
                })
                .catch((err) => {
                  logger.error("hand image err:", err);
                });
            }

            //给人分享者发奖励
            await this.shareService.rewardToShareUser.call(this, user.id, 0, 2);
          }
        }, 3000);
        setTimeout(async () => {
          //@ts-ignore
          if (!watchCode._destroyed) {
            logger.info(
              "%s generation time out, post data: %s",
              chatId,
              postData
            );
            await User.update({ credits: pre }, { where: { id: user.id } });
            await this.bot.sendMessage(
              chatId,
              "Generation time out, 1 point has been restored, please try again later."
            );
          }
          clearInterval(watchCode);
        }, 180000);
      }
    } catch (e) {
      logger.error(e);
      await User.update({ credits: rest }, { where: { id: user.id } });
      await this.bot.sendMessage(
        chatId,
        `Generation failed, 1 point has been restored, please try again later.`
      );
    }
  }
}
