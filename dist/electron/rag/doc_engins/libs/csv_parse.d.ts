/**
 * CSV解析器类
 */
export declare class CsvParser {
    private filename;
    private ragName;
    private baseDocName;
    private content;
    private records;
    private headers;
    private statistics;
    /**
     * 构造函数
     * @param filename CSV文件路径
     */
    constructor(filename: string, ragName: string);
    /**
     * 读取CSV文件内容
     * @returns 是否读取成功
     */
    private readFile;
    /**
     * 解析CSV内容
     */
    private parseContent;
    /**
     * 计算CSV统计信息
     */
    private calculateStatistics;
    /**
     * 转义单元格内容以适应Markdown表格格式
     * @param value 单元格值
     * @returns 转义后的字符串
     */
    private escapeCellValue;
    /**
     * 生成Markdown表格表示
     * @returns Markdown表格字符串
     */
    private generateTable;
    /**
     * 生成数据摘要
     * @returns Markdown格式的摘要信息
     */
    private generateSummary;
    /**
     * 将CSV数据转换为Markdown格式
     * @returns Markdown表示
     */
    private generateMarkdown;
    /**
     * 解析CSV文件
     * @returns Markdown格式的内容
     */
    parse(): Promise<string>;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 将CSV文件解析并转换为Markdown格式
 * @param filename CSV文件路径
 * @returns Markdown格式的字符串
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
