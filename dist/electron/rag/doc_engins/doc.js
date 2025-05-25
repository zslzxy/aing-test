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
exports.DocumentParser = void 0;
exports.parseDocument = parseDocument;
exports.isSupportedFileType = isSupportedFileType;
exports.getSupportedFileExtensions = getSupportedFileExtensions;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const docx_parse_1 = require("./libs/docx_parse");
const doc_parse_1 = require("./libs/doc_parse");
const xls_parse_1 = require("./libs/xls_parse");
const pdf_parse_1 = require("./libs/pdf_parse");
const csv_parse_1 = require("./libs/csv_parse");
const html_parse_1 = require("./libs/html_parse");
const image_parse_1 = require("./libs/image_parse");
const ppt_parse_1 = require("./libs/ppt_parse");
// import { parse as mdParse } from './libs/md_parse';
const txt_parse_1 = require("./libs/txt_parse");
const http_parse_1 = require("./libs/http_parse");
const utils_1 = require("./utils");
/**
 * 文档解析器类
 */
class DocumentParser {
    /**
     * 支持的文件类型映射
     * 将文件扩展名映射到相应的解析函数
     */
    static FILE_TYPE_MAP = {
        // 文档类型
        '.docx': docx_parse_1.parse,
        '.doc': doc_parse_1.parse,
        // 表格类型
        '.xlsx': xls_parse_1.parse,
        '.xls': xls_parse_1.parse,
        '.csv': csv_parse_1.parse,
        // 演示文稿类型
        '.pptx': ppt_parse_1.parse,
        '.ppt': ppt_parse_1.parse,
        // PDF文件
        '.pdf': pdf_parse_1.parse,
        // 网页文件
        '.html': html_parse_1.parse,
        '.htm': html_parse_1.parse,
        // URL地址
        'http': http_parse_1.parse,
        'https': http_parse_1.parse,
        // 图片类型
        '.jpg': image_parse_1.parse,
        '.jpeg': image_parse_1.parse,
        '.png': image_parse_1.parse,
        '.gif': image_parse_1.parse,
        '.bmp': image_parse_1.parse,
        '.webp': image_parse_1.parse,
        // Markdown文件
        '.md': txt_parse_1.parse,
        '.markdown': txt_parse_1.parse,
        // 纯文本文件
        '.txt': txt_parse_1.parse,
        '.log': txt_parse_1.parse,
        '.text': txt_parse_1.parse,
        '.conf': txt_parse_1.parse,
        '.cfg': txt_parse_1.parse,
        '.ini': txt_parse_1.parse,
        '.json': txt_parse_1.parse,
    };
    /**
     * 检查文件是否存在并可访问
     * @param filename 文件路径
     * @returns 检查结果
     */
    static async checkFile(filename) {
        try {
            await fs.promises.access(filename, fs.constants.R_OK);
            return { exists: true };
        }
        catch (error) {
            return {
                exists: false,
                error: `无法访问文件: ${error.message}`
            };
        }
    }
    /**
     * 确保输出目录存在
     */
    static ensureOutputDirectory() {
        let docSavePath = (0, utils_1.get_doc_save_path)();
        if (!fs.existsSync(docSavePath)) {
            fs.mkdirSync(docSavePath, { recursive: true });
        }
    }
    /**
     * 获取文件的扩展名（小写）
     * @param filename 文件路径
     * @returns 文件扩展名
     */
    static getFileExtension(filename) {
        // 判断是否为http或https地址
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return 'http';
        }
        return path.extname(filename).toLowerCase();
    }
    /**
     * 检查文件是否为支持的类型
     * @param filename 文件路径
     * @returns 是否支持
     */
    static isSupported(filename) {
        const extension = this.getFileExtension(filename);
        return extension in this.FILE_TYPE_MAP;
    }
    /**
     * 获取所有支持的文件扩展名
     * @returns 支持的文件扩展名数组
     */
    static getSupportedExtensions() {
        return Object.keys(this.FILE_TYPE_MAP);
    }
    /**
     * 解析文档
     * @param filename 文件路径
     * @returns 解析结果
     */
    static async parseDocument(filename, ragName) {
        try {
            // 获取文件扩展名
            const extension = this.getFileExtension(filename);
            if (extension != 'http') {
                // 检查文件是否可访问
                const fileCheck = await this.checkFile(filename);
                if (!fileCheck.exists) {
                    return {
                        success: false,
                        content: ``
                    };
                }
            }
            // 确保输出目录存在
            this.ensureOutputDirectory();
            // 检查类型是否支持
            if (!this.isSupported(filename)) {
                return {
                    success: false,
                    content: ``
                };
            }
            // 获取相应的解析函数并执行
            const parseFunction = this.FILE_TYPE_MAP[extension];
            const content = await parseFunction(filename, ragName);
            // 如果解析结果为空，返回错误信息
            if (!content || content.trim().length === 0) {
                return {
                    success: false,
                    content: ``
                };
            }
            return {
                success: true,
                content
            };
        }
        catch (error) {
            console.error('解析文档时发生错误:', error);
            return {
                success: false,
                content: ``,
                error: error.message || '未知错误'
            };
        }
    }
    /**
     * 将解析结果保存到文件
     * @param filename 原始文件路径
     * @param content 解析内容
     * @param ragName 知识库名称
     * @returns 保存的文件路径
     */
    static async saveToFile(filename, content, ragName) {
        try {
            // 确保输出目录存在
            const outputDir = path.join((0, utils_1.get_doc_save_path)(), ragName, 'markdown');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            // 为解析结果生成保存路径
            const basename = path.basename(filename);
            const outputFilename = `${basename}.md`;
            const outputPath = path.join(outputDir, outputFilename);
            // 保存解析内容
            await fs.promises.writeFile(outputPath, content, 'utf-8');
            console.log(`解析结果已保存至: ${outputPath}`);
            return {
                parsedPath: outputPath
            };
        }
        catch (error) {
            console.error('保存文件时发生错误:', error);
            throw new Error(`保存文件失败: ${error.message}`);
        }
    }
}
exports.DocumentParser = DocumentParser;
/**
 * 解析文档
 * @param filename 文件路径
 * @param ragName 知识库名称
 * @param saveToFile 是否保存到文件
 * @returns 解析结果和保存路径
 */
async function parseDocument(filename, ragName = '', saveToFile = false) {
    try {
        // 解析文档
        const result = await DocumentParser.parseDocument(filename, ragName);
        // 如果指定了要保存到文件
        let savedPath;
        if (saveToFile && result.success && ragName) {
            const saveResult = await DocumentParser.saveToFile(filename, result.content, ragName);
            savedPath = saveResult.parsedPath;
        }
        return {
            content: result.content,
            savedPath
        };
    }
    catch (error) {
        console.error('解析文档过程中出错:', error);
        return {
            content: `# 解析失败\n\n处理文件 "${path.basename(filename)}" 时出错: ${error.message || '未知错误'}`
        };
    }
}
/**
 * 检查文件类型是否受支持
 * @param filename 文件路径
 * @returns 是否支持
 */
function isSupportedFileType(filename) {
    return DocumentParser.isSupported(filename);
}
/**
 * 获取所有支持的文件扩展名
 * @returns 支持的文件扩展名数组
 */
function getSupportedFileExtensions() {
    return DocumentParser.getSupportedExtensions();
}
//# sourceMappingURL=doc.js.map