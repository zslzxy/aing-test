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
exports.local360Search = void 0;
const cheerio = __importStar(require("cheerio"));
const utils_1 = require("./utils");
// 本地搜狗搜索函数
const local360Search = async (query) => {
    try {
        const url = `https://www.so.com/s?q=${encodeURIComponent(query)}`;
        const response = await (0, utils_1.withTimeout)(fetch(url, {
            signal: new AbortController().signal,
            headers: utils_1.FETCH_HEADERS
        }), 10000);
        const htmlString = await response.text();
        const $ = cheerio.load(htmlString);
        const items = $(".res-list");
        const searchResults = [];
        items.each(function (index, item) {
            var link = $(item).find("a").attr("data-mdurl");
            var title = $(item).find("a").text();
            var content = $(item).find(".res-desc").text();
            searchResults.push({ title, link, content });
        });
        let searchResultList = searchResults.filter((result) => result.link && result.title && result.content);
        return (0, utils_1.getUrlsContent)(searchResultList);
    }
    catch (error) {
        console.error('Search request failed:', error);
        return [];
    }
};
exports.local360Search = local360Search;
//# sourceMappingURL=so360.js.map