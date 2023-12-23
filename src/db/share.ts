import { Model, BIGINT, TEXT, INTEGER, DECIMAL } from "sequelize";
import sequelize from "./index";

export interface IShare {}

class Share extends Model {}

Share.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    share_user: { type: BIGINT },
    share_click_user: { type: BIGINT },
    recharge_amount: { type: DECIMAL },
    recharge_credits: { type: INTEGER },
    user_get_credits: { type: INTEGER },
    is_recharge: { type: INTEGER },
    is_used: { type: INTEGER },
  },
  {
    sequelize,
    modelName: "share",
    tableName: "t_share",
  }
);

export default Share;
