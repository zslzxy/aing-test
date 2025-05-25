"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.localDuckDuckGoSearch = void 0;
const cheerio = __importStar(require("cheerio"));
const utils_1 = require("./utils");
// 构建请求 URL 的函数
const buildDuckDuckGoUrl = (query) => {
    return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
};
// 处理链接的函数
const processLink = (link) => {
    if (!link) {
        return '';
    }
    return decodeURIComponent(link.replace("//duckduckgo.com/l/?uddg=", "").replace(/&rut=.*/, ""));
};
// 本地 DuckDuckGo 搜索函数
const localDuckDuckGoSearch = async (query) => {
    try {
        // 构建请求 URL
        const url = buildDuckDuckGoUrl(query);
        // 发起带有超时控制的 fetch 请求
        const response = await (0, utils_1.withTimeout)(fetch(url, { signal: new AbortController().signal, headers: utils_1.FETCH_HEADERS }), 10000);
        // 获取响应的文本内容
        const htmlString = await response.text();
        // 加载 HTML 内容到 cheerio 中
        const $ = cheerio.load(htmlString);
        // 提取搜索结果
        const searchResults = Array.from($("div.results_links_deep")).map((result) => {
            const title = $(result).find("a.result__a").text();
            const link = processLink($(result).find("a.result__snippet").attr("href"));
            const content = $(result).find("a.result__snippet").text();
            return { title, link, content };
        });
        return (0, utils_1.getUrlsContent)(searchResults);
    }
    catch (error) {
        console.error('Search request failed:', error);
        // 返回空数组表示搜索失败
        return [];
    }
};
exports.localDuckDuckGoSearch = localDuckDuckGoSearch;
//# sourceMappingURL=duckduckgo.js.map