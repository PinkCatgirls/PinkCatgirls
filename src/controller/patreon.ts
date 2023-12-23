import logger from "../log";
import User from "../db/user";
import PatreonTier from "../db/patreon_tier";
import PatreonSendRecord from "../db/patreon_send_record";
import Telegram from "../telegram";
import ShareService from "../service/ShareService";
import PatreonMember from "../db/patreon_member";

const memberUpdate = async (member: any, telegram?: Telegram) => {
  logger.info("member:update memberData:", JSON.stringify(member));
  const user = member.user;
  const pinkUser = (await User.findOne({
    where: { patreon_id: user.id },
  })) as any;
  logger.info("member:update select exist user: %s", pinkUser?.dataValues);
  if (!pinkUser) {
    //如果没绑定，不处理，等绑定的时候在去查他买的什么会员卡
    return;
  }

  const memberId = member.id;
  const memberData = member.attributes;

  //查询所有的patreon的套餐
  const tierList = await PatreonTier.findAll();

  //如果订单状态是pending ，肯定是充值了，充值多少钱，看 willPayAmountCents 字段
  const flag = await needSendCredits(member, pinkUser.dataValues);
  if (flag) {
    const tierAmount = memberData.will_pay_amount_cents;
    const preTierAmount = memberData.currently_entitled_amount_cents;

    const tier = tierList.find(
      (t: any) => t.dataValues.amount_cents == tierAmount
    );

    let preTier = tierList.find(
      (t: any) => t.dataValues.amount_cents == preTierAmount
    ) as any;

    if (preTier) {
      preTier = Number(preTier.dataValues.credits);
    } else {
      preTier = 0;
    }

    if (tier && pinkUser && pinkUser.dataValues.id) {
      let credits: number;
      if (tierAmount == preTierAmount) {
        credits = Number(tier.dataValues.credits);
      } else {
        credits = Number(tier.dataValues.credits) - preTier;
      }
      logger.info(
        "member:update will_pay_amount_cents:%s ,currently_entitled_amount_cents: %s",
        tierAmount,
        preTierAmount,
        credits
      );
      if (credits < 0) {
        return;
      }

      const preCredits = Number(pinkUser.dataValues.credits);
      const endCredits = preCredits + credits;
      // 赠送credits
      await User.update(
        { credits: endCredits },
        { where: { id: pinkUser.dataValues.id } }
      );
      // 赠送记录保存
      await PatreonSendRecord.create({
        user_id: pinkUser.dataValues.id,
        patreon_user_id: member.user.id,
        member_id: member.id,
        tier_id: tier.dataValues.id,
      });

      logger.info(
        "member:update recharge user_id: %s,  credits: %s",
        pinkUser.dataValues.id,
        credits
      );

      //如果是分享进来的需要给人发奖励
      new ShareService().rewardToShareUser(
        pinkUser.dataValues.id,
        tierAmount,
        credits * 30
      );

      // bot 发送通知
      if (telegram && telegram.bot) {
        await telegram.bot.sendMessage(
          pinkUser.dataValues.id,
          `You've received ${credits} credits from Patreon. Your new balance is ${endCredits} credits.`
        );
      }
    }
  }
};

//判断是否需要发credits

async function needSendCredits(member: any, pinkUser: any): Promise<Boolean> {
  const memberData = member.attributes;
  const user = member.user;
  const exist = await PatreonMember.findOne({
    where: {
      member_id: member.id,
    },
  });
  if (exist) {
    await PatreonMember.update(
      {
        last_charge_date: memberData.last_charge_date,
        last_charge_status: memberData.last_charge_status,
        will_pay_amount_cents: memberData.will_pay_amount_cents,
      },
      {
        where: {
          id: exist.dataValues.id,
        },
      }
    );
  } else {
    await PatreonMember.create({
      user_id: pinkUser.id,
      member_id: member.id,
      patreon_user_id: user.id,
      email: memberData.email,
      last_charge_date: memberData.last_charge_date,
      last_charge_status: memberData.last_charge_status,
      will_pay_amount_cents: memberData.will_pay_amount_cents,
    });
  }

  if (memberData.last_charge_status === "Pending") {
    return true;
  }

  logger.info(
    "memberData.last_charge_date !== exist?.dataValues.last_charge_date",
    memberData.last_charge_date !== exist?.dataValues.last_charge_date,
    memberData.last_charge_date,
    exist?.dataValues.last_charge_date
  );

  if (
    memberData.last_charge_status === "Paid" &&
    memberData.last_charge_date !== exist?.dataValues.last_charge_date
  ) {
    return true;
  }

  return false;
}

export { memberUpdate };
