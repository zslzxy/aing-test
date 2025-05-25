"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxParser = void 0;
exports.parse = parse;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pizzip_1 = __importDefault(require("pizzip"));
const utils_1 = require("../utils");
const public_1 = require("../../../class/public");
/**
 * Word文档解析器类
 */
class DocxParser {
    filename;
    baseDocName;
    ragName;
    zip = null;
    documentContent = [];
    imageIndex = 0;
    /**
     * 构造函数
     * @param filename 要解析的文件路径
     */
    constructor(filename, ragName) {
        this.filename = filename;
        this.ragName = ragName;
        this.baseDocName = path_1.default.basename(filename, path_1.default.extname(filename));
    }
    /**
     * 初始化PizZip对象
     * @returns 是否成功初始化
     */
    initZip() {
        try {
            const body = fs_1.default.readFileSync(this.filename, 'binary');
            this.zip = new pizzip_1.default(body);
            return !!this.zip;
        }
        catch (error) {
            console.error('初始化zip对象失败:', error);
            return false;
        }
    }
    /**
     * 将图片保存到指定目录
     * @param imageData 图片二进制数据
     * @param imageName 图片名称
     * @returns 图片保存路径和URL
     */
    saveImage(imageData, imageName) {
        try {
            // 创建图片保存目录
            const outputDir = (0, utils_1.get_image_save_path)();
            if (!fs_1.default.existsSync(outputDir)) {
                fs_1.default.mkdirSync(outputDir, { recursive: true });
            }
            // 获取图片扩展名
            const ext = path_1.default.extname(imageName);
            // 创建唯一图片名
            const uniqueImageName = `${public_1.pub.md5(`${this.baseDocName}_${this.ragName}_${this.imageIndex++}`)}${ext}`;
            const imagePath = path_1.default.join(outputDir, this.ragName, 'images');
            const imageFile = path_1.default.resolve(imagePath, uniqueImageName);
            if (!public_1.pub.file_exists(imagePath))
                public_1.pub.mkdir(imagePath);
            const imageUrl = `${utils_1.IMAGE_URL_LAST}/images?r=${this.ragName}&n=${uniqueImageName}`;
            // 保存图片
            fs_1.default.writeFileSync(imageFile, Buffer.from(imageData));
            return { path: imageFile, url: imageUrl };
        }
        catch (error) {
            console.error('保存图片失败:', error);
            return { path: '', url: '' };
        }
    }
    /**
     * 解析文档XML中的图片关系
     * @param relationshipsXml 关系XML内容
     * @returns 图片ID与路径的映射
     */
    parseImageRelationships(relationshipsXml) {
        const imageRelationships = {};
        const relMatches = relationshipsXml.match(/<Relationship[^>]*>/g);
        if (!relMatches)
            return imageRelationships;
        relMatches.forEach(rel => {
            const idMatch = rel.match(/Id="([^"]+)"/);
            const targetMatch = rel.match(/Target="([^"]+)"/);
            const typeMatch = rel.match(/Type="[^"]*image[^"]*"/);
            if (idMatch && targetMatch && typeMatch) {
                imageRelationships[idMatch[1]] = targetMatch[1];
            }
        });
        return imageRelationships;
    }
    /**
     * 解析段落内容
     * @param paragraph 段落XML
     * @returns 提取的文本内容
     */
    parseParagraphText(paragraph) {
        const textMatches = paragraph.match(/<w:t.*?>(.*?)<\/w:t>/g) || [];
        return textMatches.map(t => t.replace(/<.*?>/g, '')).join('');
    }
    /**
     * 处理文档中的图片
     * @param paragraph 段落XML
     * @param imageRelationships 图片关系映射
     */
    processImages(paragraph, imageRelationships) {
        if (this.ragName == 'temp')
            return;
        if (!this.zip)
            return;
        const imageMatch = paragraph.match(/<a:blip r:embed="([^"]+)"/);
        if (!imageMatch || !imageRelationships[imageMatch[1]])
            return;
        const imageId = imageMatch[1];
        const imagePath = imageRelationships[imageId];
        const imageName = imagePath.split('/').pop() || "";
        // 获取图片数据
        const imageFile = this.zip.file(`word/${imagePath.replace(/^\.\.\//, '')}`);
        if (!imageFile)
            return;
        const imageData = imageFile.asUint8Array();
        // 保存图片并获取路径和URL
        const { path: savedPath, url: imageUrl } = this.saveImage(imageData, imageName);
        // 将图片信息添加到文档内容中
        if (imageUrl) {
            this.documentContent.push({
                type: 'image',
                name: imageName,
                path: savedPath,
                url: imageUrl,
                data: imageData
            });
        }
    }
    /**
     * 解析文档并生成结果
     * @returns 解析结果
     */
    async parse() {
        // 初始化zip对象
        if (!this.initZip() || !this.zip) {
            return { plainText: "", documentContent: [] };
        }
        // 读取document.xml内容
        const documentXmlFile = this.zip.file('word/document.xml');
        if (!documentXmlFile) {
            return { plainText: "", documentContent: [] };
        }
        const documentXml = documentXmlFile.asText();
        // 获取图片关系
        const relationshipsXmlFile = this.zip.file('word/_rels/document.xml.rels');
        const relationshipsXml = relationshipsXmlFile?.asText() || "";
        const imageRelationships = this.parseImageRelationships(relationshipsXml);
        // 解析文档结构
        this.documentContent = [];
        const paragraphs = documentXml.match(/<w:p.*?<\/w:p>/g) || [];
        for (const paragraph of paragraphs) {
            // 处理图片
            this.processImages(paragraph, imageRelationships);
            // 提取段落文本
            const textContent = this.parseParagraphText(paragraph);
            // 只有当文本不为空时才添加
            if (textContent.trim()) {
                this.documentContent.push({
                    type: 'text',
                    content: textContent
                });
            }
        }
        // 生成包含位置信息的纯文本
        const plainText = this.documentContent
            .map(item => {
            if (item.type === 'text') {
                return item.content;
            }
            else if (item.url) {
                return `![IMG](${item.url})`;
            }
            return '';
        })
            .filter(Boolean)
            .join('\n\n');
        return {
            plainText,
            documentContent: this.documentContent
        };
    }
    /**
     * 清理资源
     */
    dispose() {
        this.zip = null;
        this.documentContent = [];
    }
}
exports.DocxParser = DocxParser;
/**
 * 开始解析(此函数为统一入口，其它同类模块也使用此函数名作为入口)
 * @param filename 文件名
 * @returns 解析后的文本
 */
async function parse(filename, ragName) {
    try {
        const parser = new DocxParser(filename, ragName);
        const result = await parser.parse();
        parser.dispose(); // 释放资源
        return result.plainText;
    }
    catch (error) {
        console.error('解析文档失败:', error);
        return '';
    }
}
//# sourceMappingURL=docx_parse.js.map