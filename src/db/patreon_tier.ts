import { Model, BIGINT, TEXT, INTEGER, DECIMAL } from "sequelize";
import sequelize from "./index";

export interface IShare {}

class PatreonTier extends Model {}

PatreonTier.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    tier_title: { type: TEXT },
    amount_cents: { type: INTEGER },
    credits: { type: INTEGER },
  },
  {
    sequelize,
    modelName: "patreon_tier",
    tableName: "t_patreon_tier",
  }
);

export default PatreonTier;
