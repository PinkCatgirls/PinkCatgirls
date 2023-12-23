import { Model, BIGINT, TEXT, INTEGER } from "sequelize";
import sequelize from "./index";

export interface IShare {}

class PatreonFetchRecord extends Model {}

PatreonFetchRecord.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    response: { type: TEXT },
  },
  {
    sequelize,
    modelName: "patreon_fetch_record",
    tableName: "t_patreon_fetch_record",
  }
);

export default PatreonFetchRecord;
