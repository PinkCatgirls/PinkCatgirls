declare class ShareService {
    private readonly BASE_URL;
    constructor();
    createShareLink(userId: number): string;
    /**
     *
     */
    clickShreLinkRecord(shareCode: string, shareClickUser: number): Promise<void>;
    /**
     * 给分享者发奖励
     * @param share_click_user 被分享的人
     * @param recharge_amount 被分享人充的钱
     * @param recharge_credits 被分享人得到的credits
     */
    rewardToShareUser(share_click_user: number, recharge_amount: number, recharge_credits: number): Promise<void>;
}
export default ShareService;
