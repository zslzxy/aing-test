"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localBaiduSearch = void 0;
const utils_1 = require("./utils");
// 本地百度搜索函数
const localBaiduSearch = async (query) => {
    const TOTAL_SEARCH_RESULTS = 10;
    // 构建请求 URL
    const url = `http://www.baidu.com/s?wd=${encodeURIComponent(query)}&tn=json&rn=${TOTAL_SEARCH_RESULTS}`;
    try {
        // 发起带有超时控制的 fetch 请求
        const response = await (0, utils_1.withTimeout)(fetch(url, { signal: new AbortController().signal, headers: utils_1.FETCH_HEADERS }), 10000);
        // 解析响应为 JSON
        const jsonRes = await response.json();
        // 提取搜索结果数据
        const data = jsonRes?.feed?.entry || [];
        // 处理搜索结果数据
        const searchResults = data.map((result) => {
            const title = result?.title || "";
            const link = result?.url;
            const content = result?.abs || "";
            return { title, link, content };
        });
        // 过滤掉没有链接的结果
        let resultList = searchResults.filter((result) => result?.link);
        resultList = await (0, utils_1.getUrlsContent)(resultList);
        return resultList;
    }
    catch (error) {
        console.error('Search request failed:', error);
        // 返回空数组表示搜索失败
        return [];
    }
};
exports.localBaiduSearch = localBaiduSearch;
//# sourceMappingURL=baidu.js.map