interface ParseResult {
    success: boolean;
    content: string;
    error?: string;
}
/**
 * 文档解析器类
 */
export declare class DocumentParser {
    /**
     * 支持的文件类型映射
     * 将文件扩展名映射到相应的解析函数
     */
    private static FILE_TYPE_MAP;
    /**
     * 检查文件是否存在并可访问
     * @param filename 文件路径
     * @returns 检查结果
     */
    private static checkFile;
    /**
     * 确保输出目录存在
     */
    private static ensureOutputDirectory;
    /**
     * 获取文件的扩展名（小写）
     * @param filename 文件路径
     * @returns 文件扩展名
     */
    private static getFileExtension;
    /**
     * 检查文件是否为支持的类型
     * @param filename 文件路径
     * @returns 是否支持
     */
    static isSupported(filename: string): boolean;
    /**
     * 获取所有支持的文件扩展名
     * @returns 支持的文件扩展名数组
     */
    static getSupportedExtensions(): string[];
    /**
     * 解析文档
     * @param filename 文件路径
     * @returns 解析结果
     */
    static parseDocument(filename: string, ragName: string): Promise<ParseResult>;
    /**
     * 将解析结果保存到文件
     * @param filename 原始文件路径
     * @param content 解析内容
     * @param ragName 知识库名称
     * @returns 保存的文件路径
     */
    static saveToFile(filename: string, content: string, ragName: string): Promise<{
        parsedPath: string;
    }>;
}
/**
 * 解析文档
 * @param filename 文件路径
 * @param ragName 知识库名称
 * @param saveToFile 是否保存到文件
 * @returns 解析结果和保存路径
 */
export declare function parseDocument(filename: string, ragName?: string, saveToFile?: boolean): Promise<{
    content: string;
    savedPath?: string;
}>;
/**
 * 检查文件类型是否受支持
 * @param filename 文件路径
 * @returns 是否支持
 */
export declare function isSupportedFileType(filename: string): boolean;
/**
 * 获取所有支持的文件扩展名
 * @returns 支持的文件扩展名数组
 */
export declare function getSupportedFileExtensions(): string[];
export {};
