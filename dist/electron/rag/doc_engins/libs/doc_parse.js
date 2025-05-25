"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const WordExtractor = require("word-extractor");
/**
 * 开始解析(此函数为统一入口，其它同类模块也使用此函数名作为入口)
 * @param filename 文件名
 * @returns 解析后的文本
 */
async function parse(filename, ragName) {
    try {
        const extractor = new WordExtractor();
        const extracted = await extractor.extract(filename);
        let result = extracted.getBody();
        return result;
    }
    catch (error) {
        console.error('解析文档失败:', error);
        return '';
    }
}
//# sourceMappingURL=doc_parse.js.map