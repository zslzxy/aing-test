"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const html_parse_1 = require("./html_parse");
async function parse(url, ragName) {
    try {
        return await (0, html_parse_1.parse)(url, ragName);
    }
    catch (error) {
        console.error('请求失败:', error);
        return '';
    }
}
//# sourceMappingURL=http_parse.js.map