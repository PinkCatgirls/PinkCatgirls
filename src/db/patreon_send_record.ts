import { Model, BIGINT, TEXT, INTEGER, DATE } from "sequelize";
import sequelize from "./index";

export interface IShare {}

class PatreonSendRecord extends Model {}

PatreonSendRecord.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    user_id: { type: BIGINT },
    patreon_user_id: { type: TEXT },
    member_id: { type: TEXT },
    tier_id: { type: INTEGER },
  },
  {
    sequelize,
    modelName: "patreon_send_record",
    tableName: "t_patreon_send_record",
  }
);

export default PatreonSendRecord;
