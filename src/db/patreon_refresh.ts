import { Model, BIGINT, TEXT, INTEGER, DECIMAL } from "sequelize";
import sequelize from "./index";

export interface IShare {}

class PatreonRefresh extends Model {}

PatreonRefresh.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    refresh_token: { type: TEXT },
  },
  {
    sequelize,
    modelName: "patreon_refresh",
    tableName: "t_patreon_refresh",
  }
);

export default PatreonRefresh;
