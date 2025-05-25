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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdParser = void 0;
exports.parse = parse;
const utils_1 = require("../utils");
const public_1 = require("../../../class/public");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Markdown解析器类
 */
class MdParser {
    filename;
    ragName;
    baseDocName;
    imageIndex = 0;
    content = '';
    images = [];
    /**
     * 构造函数
     * @param filename Markdown文件路径
     */
    constructor(filename, ragName) {
        this.filename = filename;
        this.ragName = ragName;
        this.baseDocName = path.basename(filename, path.extname(filename));
    }
    /**
     * 读取Markdown文件内容
     * @returns 是否成功读取
     */
    readFile() {
        try {
            this.content = fs.readFileSync(this.filename, 'utf8');
            return true;
        }
        catch (error) {
            console.error('读取Markdown文件失败:', error);
            return false;
        }
    }
    /**
     * 保存图片
     * @param src 图片URL或本地路径
     * @returns 保存后的图片路径和URL
     */
    async saveImage(src) {
        try {
            // 创建图片保存目录
            const outputDir = path.join((0, utils_1.get_image_save_path)(), 'md');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            // 处理不同类型的图片源
            let imageData;
            let ext = '.png'; // 默认扩展名
            if (src.startsWith('data:')) {
                // 处理Base64编码的图片
                const matches = src.match(/^data:image\/([a-zA-Z0-9]+);base64,(.*)$/);
                if (!matches)
                    return null;
                const imageType = matches[1];
                const base64Data = matches[2];
                ext = `.${imageType}`;
                imageData = Buffer.from(base64Data, 'base64');
            }
            else if (src.startsWith('http')) {
                // 处理远程图片
                const response = await (0, node_fetch_1.default)(src);
                if (!response.ok)
                    return null;
                imageData = Buffer.from(await response.arrayBuffer());
                const contentType = response.headers.get('content-type');
                if (contentType) {
                    const imageType = contentType.split('/')[1];
                    ext = `.${imageType}`;
                }
            }
            else {
                // 处理本地图片
                const imagePath = path.isAbsolute(src) ? src : path.join(path.dirname(this.filename), src);
                if (!fs.existsSync(imagePath))
                    return null;
                imageData = fs.readFileSync(imagePath);
                ext = path.extname(imagePath);
            }
            // 创建唯一图片名
            const uniqueImageName = `${public_1.pub.md5(`${this.baseDocName}_${this.imageIndex++}`)}${ext}`;
            const imagePath = path.join(outputDir, this.ragName, 'images');
            const imageFile = path.resolve(imagePath, uniqueImageName);
            if (public_1.pub.file_exists(imagePath))
                public_1.pub.mkdir(imagePath);
            const imageUrl = `${utils_1.IMAGE_URL_LAST}/images?r=${this.ragName}&n=${uniqueImageName}`;
            // 保存图片
            fs.writeFileSync(imageFile, imageData);
            return {
                originalSrc: src,
                newPath: imageFile,
                newUrl: imageUrl
            };
        }
        catch (error) {
            console.error('保存图片失败:', error);
            return null;
        }
    }
    /**
     * 处理Markdown中的图片引用
     */
    async processImages() {
        if (this.ragName == 'temp')
            return;
        // 匹配Markdown中的图片引用 ![alt](url)
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        // 收集所有图片引用
        const imagesToProcess = [];
        while ((match = imageRegex.exec(this.content)) !== null) {
            const alt = match[1];
            const src = match[2];
            imagesToProcess.push({
                alt,
                src,
                fullMatch: match[0],
                index: match.index
            });
        }
        // 处理每个图片
        for (const img of imagesToProcess) {
            const savedImage = await this.saveImage(img.src);
            if (savedImage) {
                this.images.push(savedImage);
                // 替换原始图片引用
                const newImageMarkdown = `![${img.alt}](${savedImage.newUrl})`;
                this.content = this.content.replace(img.fullMatch, newImageMarkdown);
            }
        }
    }
    /**
     * 解析Markdown文件
     * @returns 处理后的Markdown内容
     */
    async parse() {
        if (!this.readFile()) {
            return '';
        }
        await this.processImages();
        return this.content;
    }
    /**
     * 清理资源
     */
    dispose() {
        this.content = '';
        this.images = [];
    }
}
exports.MdParser = MdParser;
/**
 * 开始解析(此函数为统一入口，其它同类模块也使用此函数名作为入口)
 * @param filename Markdown文件路径
 * @returns 处理后的Markdown内容
 */
async function parse(filename, ragName) {
    try {
        const parser = new MdParser(filename, ragName);
        const markdown = await parser.parse();
        parser.dispose(); // 释放资源
        return markdown;
    }
    catch (error) {
        console.error('解析Markdown失败:', error);
        return '';
    }
}
//# sourceMappingURL=md_parse.js.map