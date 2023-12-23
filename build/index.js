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
const telegram_1 = require("./telegram");
const controller_1 = require("./controller");
const statisticsJob_1 = require("./job/statisticsJob");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const telegram = new telegram_1.default();
        console.log("starting ...");
        yield telegram.setup();
        console.log("starting web");
        (0, controller_1.default)(telegram);
        //job 启动
        console.log("starting job");
        // patreonJob(telegram);
        (0, statisticsJob_1.default)(telegram);
        console.log("started");
    });
}
main();
