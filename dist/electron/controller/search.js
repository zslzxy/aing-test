"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../search_engines/search");
const public_1 = require("../class/public");
/**
 * rag controller 类，负责管理知识库的相关操作
 * @class
 */
class SearchController {
    async search(args) {
        let { query, searchProvider } = args;
        if (!query) {
            return public_1.pub.return_error(public_1.pub.lang('请输入搜索内容'));
        }
        if (!searchProvider) {
            searchProvider = 'baidu';
        }
        const result = await (0, search_1.search)(query, searchProvider);
        return public_1.pub.return_success(public_1.pub.lang('搜索成功'), result);
    }
}
/**
 * 重写 SearchController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
SearchController.toString = () => '[class SearchController]';
exports.default = SearchController;
//# sourceMappingURL=search.js.map