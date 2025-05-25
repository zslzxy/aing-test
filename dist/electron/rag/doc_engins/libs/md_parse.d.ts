/**
 * Markdown解析器类
 */
export declare class MdParser {
    private filename;
    private ragName;
    private baseDocName;
    private imageIndex;
    private content;
    private images;
    /**
     * 构造函数
     * @param filename Markdown文件路径
     */
    constructor(filename: string, ragName: string);
    /**
     * 读取Markdown文件内容
     * @returns 是否成功读取
     */
    private readFile;
    /**
     * 保存图片
     * @param src 图片URL或本地路径
     * @returns 保存后的图片路径和URL
     */
    private saveImage;
    /**
     * 处理Markdown中的图片引用
     */
    private processImages;
    /**
     * 解析Markdown文件
     * @returns 处理后的Markdown内容
     */
    parse(): Promise<string>;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 开始解析(此函数为统一入口，其它同类模块也使用此函数名作为入口)
 * @param filename Markdown文件路径
 * @returns 处理后的Markdown内容
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
