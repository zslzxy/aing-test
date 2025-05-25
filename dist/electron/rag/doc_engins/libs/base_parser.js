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
exports.BaseDocumentParser = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
/**
 * 基础文档解析器类
 */
class BaseDocumentParser {
    filename;
    baseDocName;
    content = '';
    imageIndex = 0;
    /**
     * 构造函数
     * @param filename 文件路径
     */
    constructor(filename) {
        this.filename = filename;
        this.baseDocName = path.basename(filename);
    }
    /**
     * 验证文件是否存在且可访问
     * @returns 是否可访问
     */
    validateFile() {
        try {
            fs.accessSync(this.filename, fs.constants.R_OK);
            return true;
        }
        catch (error) {
            console.error(`文件访问失败: ${this.filename}`, error);
            return false;
        }
    }
    /**
     * 确保图片保存目录存在
     * @param subDir 子目录名
     * @returns 完整的输出目录路径
     */
    ensureImageDirectory(subDir) {
        const outputDir = path.join((0, utils_1.get_image_save_path)(), subDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        return outputDir;
    }
    /**
     * 生成唯一的图片名称
     * @param prefix 前缀
     * @param ext 扩展名
     * @returns 唯一的图片名称
     */
    generateUniqueImageName(prefix, ext = '.png') {
        const timestamp = Date.now();
        return `${prefix}_${timestamp}_${this.imageIndex++}${ext}`;
    }
    /**
     * 保存图片并返回URL
     * @param imageData 图片数据
     * @param subDir 子目录名
     * @param prefix 文件名前缀
     * @param ext 文件扩展名
     * @returns 图片URL
     */
    saveImage(imageData, subDir, prefix, ext = '.png') {
        const outputDir = this.ensureImageDirectory(subDir);
        const imageName = this.generateUniqueImageName(prefix, ext);
        const imagePath = path.join(outputDir, imageName);
        fs.writeFileSync(imagePath, Buffer.from(imageData));
        return `${utils_1.IMAGE_URL_LAST}/${subDir}/${imageName}`;
    }
    /**
     * 清理资源
     */
    dispose() {
        this.content = '';
        this.imageIndex = 0;
    }
    /**
     * 转义Markdown特殊字符
     * @param text 需要转义的文本
     * @returns 转义后的文本
     */
    escapeMarkdown(text) {
        return text
            .replace(/[\\`*_{}\[\]()#+\-.!]/g, '\\$&')
            .replace(/\|/g, '\\|')
            .replace(/\n/g, '<br>');
    }
    /**
     * 格式化错误信息
     * @param error 错误对象
     * @returns 格式化的错误信息
     */
    formatError(error) {
        return `# 解析失败\n\n无法解析文件 ${this.baseDocName}。错误: ${error?.message || '未知错误'}`;
    }
}
exports.BaseDocumentParser = BaseDocumentParser;
//# sourceMappingURL=base_parser.js.map