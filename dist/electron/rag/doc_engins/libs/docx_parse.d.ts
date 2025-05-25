interface DocumentItem {
    type: 'text' | 'image';
    content?: string;
    name?: string;
    path?: string;
    url?: string;
    data?: Uint8Array;
}
interface DocxParseResult {
    plainText: string;
    documentContent: DocumentItem[];
}
/**
 * Word文档解析器类
 */
export declare class DocxParser {
    private filename;
    private baseDocName;
    private ragName;
    private zip;
    private documentContent;
    private imageIndex;
    /**
     * 构造函数
     * @param filename 要解析的文件路径
     */
    constructor(filename: string, ragName: string);
    /**
     * 初始化PizZip对象
     * @returns 是否成功初始化
     */
    private initZip;
    /**
     * 将图片保存到指定目录
     * @param imageData 图片二进制数据
     * @param imageName 图片名称
     * @returns 图片保存路径和URL
     */
    private saveImage;
    /**
     * 解析文档XML中的图片关系
     * @param relationshipsXml 关系XML内容
     * @returns 图片ID与路径的映射
     */
    private parseImageRelationships;
    /**
     * 解析段落内容
     * @param paragraph 段落XML
     * @returns 提取的文本内容
     */
    private parseParagraphText;
    /**
     * 处理文档中的图片
     * @param paragraph 段落XML
     * @param imageRelationships 图片关系映射
     */
    private processImages;
    /**
     * 解析文档并生成结果
     * @returns 解析结果
     */
    parse(): Promise<DocxParseResult>;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 开始解析(此函数为统一入口，其它同类模块也使用此函数名作为入口)
 * @param filename 文件名
 * @returns 解析后的文本
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
export {};
