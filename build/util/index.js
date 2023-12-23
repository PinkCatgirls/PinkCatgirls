"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderDescriptionTemplate = exports.generateOrderId = void 0;
function generateOrderId() {
    const now = new Date();
    let year = now.getFullYear().toString();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    // 个位数补齐十位数
    let monthStr = month < 10 ? "0" + month : month;
    let dayStr = day < 10 ? "0" + day : day;
    let hourStr = hour < 10 ? "0" + hour : hour;
    let minutesStr = minutes < 10 ? "0" + minutes : minutes;
    let secondsStr = seconds < 10 ? "0" + seconds : seconds;
    // 存放订单号
    let num = "";
    // N位随机数(加在时间戳后面)
    for (let i = 0; i < 5; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return year + monthStr + dayStr + hourStr + minutesStr + secondsStr + num;
}
exports.generateOrderId = generateOrderId;
function orderDescriptionTemplate(combo) {
    return `Package: ${combo}`;
}
exports.orderDescriptionTemplate = orderDescriptionTemplate;
