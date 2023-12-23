import { Model, BIGINT, TEXT, INTEGER, DECIMAL } from "sequelize";
import sequelize from "./index";

class PatreonMember extends Model {}

PatreonMember.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    patreon_user_id: { type: TEXT },
    member_id: { type: TEXT },
    user_id: { type: BIGINT },
    email: { type: TEXT },
    last_charge_date: { type: TEXT },
    last_charge_status: { type: TEXT },
    will_pay_amount_cents: { type: TEXT },
  },
  {
    sequelize,
    modelName: "patreon_member",
    tableName: "t_patreon_member",
  }
);

export default PatreonMember;
