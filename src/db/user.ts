import { Model, BIGINT, TEXT, INTEGER } from "sequelize";
import sequelize from "./index";
import * as TelegramBot from "node-telegram-bot-api";

export interface IUser {
  id: number;
  user_name: string;
  credits: number;
  state: number;
  created_at: Date;
  updated_at: Date;
  patreon_id: string;
  patreon_email: string
}

class User extends Model {
  static insertData: (user: TelegramBot.User) => Promise<IUser>;
  static getUser: (id: number) => Promise<IUser>;
}

User.init(
  {
    id: { type: BIGINT, unique: true, primaryKey: true },
    user_name: { type: TEXT },
    credits: { type: INTEGER, defaultValue: 0 },
    state: { type: INTEGER, defaultValue: 1 },
    patreon_id: { type: TEXT },
    patreon_email: { type: TEXT },
  },
  {
    sequelize,
    modelName: "user",
    tableName: "t_user",
  }
);

User.insertData = async function (user: TelegramBot.User) {
  let existUser = await User.findByPk(user.id);
  if (existUser) {
    return existUser.dataValues;
  }

  existUser = await User.create({
    id: user.id,
    user_name: user.username,
    credits: 1,
  });
  return existUser.dataValues;
};

User.getUser = async function name(id: number) {
  const data = await User.findByPk(id);
  return data?.dataValues;
};

export default User;
