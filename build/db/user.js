"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class User extends sequelize_1.Model {
}
User.init({
    id: { type: sequelize_1.BIGINT, unique: true, primaryKey: true },
    user_name: { type: sequelize_1.TEXT },
    credits: { type: sequelize_1.INTEGER, defaultValue: 0 },
    state: { type: sequelize_1.INTEGER, defaultValue: 1 },
    patreon_id: { type: sequelize_1.TEXT },
    patreon_email: { type: sequelize_1.TEXT },
}, {
    sequelize: index_1.default,
    modelName: "user",
    tableName: "t_user",
});
User.insertData = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        let existUser = yield User.findByPk(user.id);
        if (existUser) {
            return existUser.dataValues;
        }
        existUser = yield User.create({
            id: user.id,
            user_name: user.username,
            credits: 1,
        });
        return existUser.dataValues;
    });
};
User.getUser = function name(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield User.findByPk(id);
        return data === null || data === void 0 ? void 0 : data.dataValues;
    });
};
exports.default = User;
