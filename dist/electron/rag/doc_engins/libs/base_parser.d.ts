/**
 * 基础文档解析器接口
 */
export interface BaseParserResult {
    success: boolean;
    content: string;
    error?: string;
}
/**
 * 基础文档解析器类
 */
export declare abstract class BaseDocumentParser {
    protected filename: string;
    protected baseDocName: string;
    protected content: string;
    protected imageIndex: number;
    /**
     * 构造函数
     * @param filename 文件路径
     */
    constructor(filename: string);
    /**
     * 验证文件是否存在且可访问
     * @returns 是否可访问
     */
    protected validateFile(): boolean;
    /**
     * 确保图片保存目录存在
     * @param subDir 子目录名
     * @returns 完整的输出目录路径
     */
    protected ensureImageDirectory(subDir: string): string;
    /**
     * 生成唯一的图片名称
     * @param prefix 前缀
     * @param ext 扩展名
     * @returns 唯一的图片名称
     */
    protected generateUniqueImageName(prefix: string, ext?: string): string;
    /**
     * 保存图片并返回URL
     * @param imageData 图片数据
     * @param subDir 子目录名
     * @param prefix 文件名前缀
     * @param ext 文件扩展名
     * @returns 图片URL
     */
    protected saveImage(imageData: Buffer | Uint8Array, subDir: string, prefix: string, ext?: string): string;
    /**
     * 清理资源
     */
    protected dispose(): void;
    /**
     * 解析文档
     * @returns 解析结果
     */
    abstract parse(): Promise<BaseParserResult>;
    /**
     * 转义Markdown特殊字符
     * @param text 需要转义的文本
     * @returns 转义后的文本
     */
    protected escapeMarkdown(text: string): string;
    /**
     * 格式化错误信息
     * @param error 错误对象
     * @returns 格式化的错误信息
     */
    protected formatError(error: any): string;
}
