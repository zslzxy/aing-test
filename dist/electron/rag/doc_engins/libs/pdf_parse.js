"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfParser = void 0;
exports.parse = parse;
const fs_1 = __importDefault(require("fs"));
// import * as pdfjsLib from 'pdfjs-dist';
// 封装错误处理和日志记录
const logError = (message, error) => {
    console.error(`${message}:`, error);
};
/**
 * PDF解析器类
 */
class PdfParser {
    filename;
    pdfDocument;
    /**
     * 构造函数
     * @param filename PDF文件路径
     */
    constructor(filename, ragName) {
        this.filename = filename;
    }
    /**
     * 初始化PDF.js和加载文档
     * @returns 是否成功初始化
     */
    async initPdfDocument() {
        try {
            if (!fs_1.default.existsSync(this.filename)) {
                logError(`文件不存在`, this.filename);
                return false;
            }
            const pdfjsLib = await import('pdfjs-dist');
            const data = new Uint8Array(fs_1.default.readFileSync(this.filename));
            const loadingTask = pdfjsLib.getDocument({ data });
            this.pdfDocument = await loadingTask.promise;
            return true;
        }
        catch (error) {
            logError('初始化PDF文档失败', error);
            return false;
        }
    }
    /**
     * 解析PDF文件
     * @returns Markdown格式的内容
     */
    async parse() {
        if (!(await this.initPdfDocument()) || !this.pdfDocument) {
            return '';
        }
        let text = "";
        for (let i = 1; i <= this.pdfDocument.numPages; i++) {
            const page = await this.pdfDocument.getPage(i);
            const textContent = await page.getTextContent({ includeMarkedContent: true });
            let items = textContent.items;
            let isEndMarkedContent = false;
            let endMarkedContent = 0;
            let isStart = true;
            for (let item of items) {
                // 标记内容结束
                if (item.type == 'endMarkedContent') {
                    endMarkedContent++;
                }
                // 拼接文本
                if (item.fontName) {
                    text += item.str;
                    endMarkedContent = 0;
                }
                // 根据标记增加换行符，并重置标记
                if (endMarkedContent == 2) {
                    text += "\n";
                    endMarkedContent = 0;
                    isEndMarkedContent = true;
                }
                // 开始和EOL标记视结束标记情况增加换行符
                if ((item.hasEOL && isStart) || (!isEndMarkedContent && item.hasEOL)) {
                    text += "\n";
                    isStart = false;
                }
            }
            // 每页结束增加换行符
            text += "\n";
        }
        // 去掉不可见字符
        text = text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "");
        text = text.replace(/[]/g, "");
        return text.trim();
    }
    /**
     * 清理资源
     */
    dispose() {
        if (this.pdfDocument) {
            this.pdfDocument.destroy();
            this.pdfDocument = null;
        }
    }
}
exports.PdfParser = PdfParser;
/**
 * 将 PDF 文件解析并转换为 Markdown 格式
 * @param filename PDF 文件路径
 * @returns Markdown 格式的字符串
 */
async function parse(filename, ragName) {
    try {
        const parser = new PdfParser(filename, ragName);
        const markdown = await parser.parse();
        return markdown;
    }
    catch (error) {
        logError('解析 PDF 文件失败', error);
        return '';
    }
}
//# sourceMappingURL=pdf_parse.js.map