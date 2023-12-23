import Decimal from "decimal.js";
import Share from "../db/share";
import User from "../db/user";
import logger from "../log";
import { API_URL } from "../config";

class ShareService {
  private readonly BASE_URL = `${API_URL}/bot`

  constructor() {}

  createShareLink(userId: number): string {
    const base64 = Buffer.from(userId.toString(), "utf8").toString("base64");
    return `${this.BASE_URL}?start=` + base64;
  }

  /**
   *
   */
  async clickShreLinkRecord(shareCode: string, shareClickUser: number) {
    const share_user = Number(
      Buffer.from(shareCode, "base64").toString("utf-8")
    );
    if (!share_user) {
      return;
    }
    //不能给自己分享
    if (share_user === shareClickUser) {
      return;
    }

    //判断链接否存在
    const exist = await Share.findOne({
      where: { share_user, share_click_user: shareClickUser },
    });
    if (exist) {
      return;
    }
    await Share.create({
      share_user,
      share_click_user: shareClickUser,
    });
  }

  /**
   * 给分享者发奖励
   * @param share_click_user 被分享的人
   * @param recharge_amount 被分享人充的钱
   * @param recharge_credits 被分享人得到的credits
   */
  async rewardToShareUser(
    share_click_user: number,
    recharge_amount: number,
    recharge_credits: number
  ) {
    //查询还没有被充值过的, 其实是只有一条的数据
    let shareUserList;
    if (recharge_amount == 0) {
      shareUserList = await Share.findAll({
        where: { share_click_user, is_used: 0 },
      });
    } else {
      shareUserList = await Share.findAll({
        where: { share_click_user, is_recharge: 0 },
      });
    }

    if (shareUserList.length === 0) {
      return;
    }

    logger.info(
      "ShareService rewardToShareUser shareList=",
      JSON.stringify(shareUserList)
    );

    const getCredits = recharge_credits * 0.5;
    //循环发奖
    for (const share of shareUserList) {
      const share_user = share.dataValues.share_user;
      const user = await User.findByPk(share_user);
      if (!user) {
        return;
      }
      const preCredits = user.dataValues.credits;
      const restCredits = getCredits + preCredits;
      //发奖
      await User.update(
        { credits: restCredits },
        {
          where: {
            id: share_user,
          },
        }
      );
      //更新分享状态
      let updateData = {
        recharge_amount,
        recharge_credits,
        user_get_credits: getCredits,
      } as any;
      if (recharge_amount == 0) {
        updateData.is_used = 1;
      } else {
        updateData.is_recharge = 1;
      }
      await Share.update(updateData, {
        where: {
          id: share.dataValues.id,
        },
      });
      //@ts-ignore
      if (this?.bot) {
        //@ts-ignore
        await this.bot.sendMessage(
          share_user,
          `You've received ${getCredits} credits from ${share_click_user}. Your new balance is ${restCredits} credits.`
        );
      }
    }
  }
}

export default ShareService;
