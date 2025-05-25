/**
 * HTML解析器类
 */
export declare class HtmlParser {
    private filename;
    private ragName;
    private baseDocName;
    private $;
    /**
     * 构造函数
     * @param filename HTML文件路径
     */
    constructor(filename: string, ragName: string);
    /**
     * 初始化Cheerio对象
     * @returns 是否成功初始化
     */
    private initCheerio;
    /**
     * 清理干扰元素
     */
    private cleanInterferenceElements;
    /**
     * 将HTML转换为Markdown
     * @returns Markdown文本
     */
    private convertToMarkdown;
    /**
     * 解析HTML文件并转换为Markdown
     * @returns Markdown文本
     */
    parse(): Promise<string>;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 开始解析(此函数为统一入口，其它同类模块也使用此函数名作为入口)
 * @param filename HTML文件路径
 * @returns Markdown格式的字符串
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
