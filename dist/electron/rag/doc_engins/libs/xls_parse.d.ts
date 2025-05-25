/**
 * Excel解析器类
 */
export declare class ExcelParser {
    private filename;
    private ragName;
    private baseDocName;
    private workbook;
    private workbookData;
    /**
     * 构造函数
     * @param filename Excel文件路径
     */
    constructor(filename: string, ragName: string);
    /**
     * 读取Excel文件并解析工作簿
     * @returns 是否成功读取
     */
    private readWorkbook;
    /**
     * 解析工作簿数据
     * @returns 工作簿数据对象
     */
    private parseWorkbookData;
    /**
     * 将单元格值转换为安全的Markdown字符串
     * @param value 单元格值
     * @returns 转义后的字符串
     */
    private escapeCellValue;
    /**
     * 将工作表数据转换为Markdown表格
     * @param sheet 工作表数据
     * @returns Markdown表格字符串
     */
    private sheetToMarkdown;
    /**
     * 检查并提取工作表中的图表或图片
     * 注意：此功能需要更高级的库支持，目前仅作为占位符
     * @param sheet 工作表对象
     * @returns 相关的Markdown字符串（如有）
     */
    private extractSheetCharts;
    /**
     * 生成完整的Markdown文档
     * @returns Markdown格式的字符串
     */
    private generateMarkdown;
    /**
     * 解析Excel文件
     * @returns Markdown格式的内容
     */
    parse(): Promise<string>;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 将 Excel 文件解析并转换为 Markdown 格式
 * @param filename Excel 文件路径
 * @param ragName 名称
 * @returns Markdown 格式的字符串
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
