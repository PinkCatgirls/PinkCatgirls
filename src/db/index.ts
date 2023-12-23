import { Sequelize } from "sequelize";
import { database } from "../config";
import { info } from "../log";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: database.host,
  port: database.port,
  username: database.user,
  password: database.password,
  database: database.dbName,
  logging: info,
  timezone: "+08:00",
  logQueryParameters: true,
  dialectOptions: {
    dateStrings: true,
  },
  define: {
    // create_time && update_time
    timestamps: true, // delete_time
    paranoid: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: false, // 把驼峰命名转换为下划线
    underscored: true,
    scopes: {
      bh: {
        attributes: {
          exclude: ["password", "updated_at", "created_at"],
        },
      },
      iv: {
        attributes: {
          exclude: ["content", "password", "updated_at"],
        },
      },
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// 创建模型
sequelize.sync({
  force: false,
});

export default sequelize;
