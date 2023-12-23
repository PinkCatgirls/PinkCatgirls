import { Model, BIGINT, TEXT, INTEGER, DECIMAL } from "sequelize";
import sequelize from "./index";

export interface IShare {}

class CommandRecord extends Model {}

CommandRecord.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    command_name: { type: TEXT },
    user_id: { type: BIGINT },
  },
  {
    sequelize,
    modelName: "share",
    tableName: "t_command_record",
  }
);

export default CommandRecord;
