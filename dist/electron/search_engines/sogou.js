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
exports.localSogouSearch = void 0;
const cheerio = __importStar(require("cheerio"));
const utils_1 = require("./utils");
// 获取正确目标 URL 的函数
const getCorrectTargeUrl = async (url) => {
    if (!url)
        return "";
    try {
        const res = await fetch(url, { headers: utils_1.FETCH_HEADERS });
        const $ = cheerio.load(await res.text());
        const link = $("script").text();
        const matches = link.match(/"(.*?)"/);
        return matches?.[1] || "";
    }
    catch (error) {
        console.error('Error getting correct target URL:', error);
        return "";
    }
};
// 处理搜索结果节点的函数
const processSearchResultNode = async ($el) => {
    const title = $el.find(".vr-title").text().replace(/\n/g, "").trim();
    let link = $el.find(".vr-title > a").attr("href");
    [".text-lightgray", ".zan-box", ".tag-website"].forEach((cls) => {
        $el.find(cls).remove();
    });
    const content = [".star-wiki", ".fz-mid", ".attribute-centent"]
        .map((selector) => $el.find(selector).text().trim())
        .join(" ");
    if (link && link.startsWith("/")) {
        link = await getCorrectTargeUrl(`https://www.sogou.com${link}`);
    }
    return { title, link: link || "", content };
};
// 本地搜狗搜索函数
const localSogouSearch = async (query) => {
    try {
        const url = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
        const response = await (0, utils_1.withTimeout)(fetch(url, {
            signal: new AbortController().signal
        }), 10000);
        const htmlString = await response.text();
        const $ = cheerio.load(htmlString);
        const $result = $("#main .results");
        const nodes = $result.children().toArray();
        const searchResultsPromises = nodes.map((node) => processSearchResultNode($(node)));
        const searchResults = await Promise.all(searchResultsPromises);
        let searchResultList = searchResults.filter((result) => result.link && result.title && result.content);
        return (0, utils_1.getUrlsContent)(searchResultList);
    }
    catch (error) {
        console.error('Search request failed:', error);
        return [];
    }
};
exports.localSogouSearch = localSogouSearch;
//# sourceMappingURL=sogou.js.map