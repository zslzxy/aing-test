/**
 * PDF解析器类
 */
export declare class PdfParser {
    private filename;
    private pdfDocument;
    /**
     * 构造函数
     * @param filename PDF文件路径
     */
    constructor(filename: string, ragName: string);
    /**
     * 初始化PDF.js和加载文档
     * @returns 是否成功初始化
     */
    private initPdfDocument;
    /**
     * 解析PDF文件
     * @returns Markdown格式的内容
     */
    parse(): Promise<string>;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 将 PDF 文件解析并转换为 Markdown 格式
 * @param filename PDF 文件路径
 * @returns Markdown 格式的字符串
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
