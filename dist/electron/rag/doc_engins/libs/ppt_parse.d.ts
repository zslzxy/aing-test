/**
 * PPT解析器类
 */
export declare class PptxParser {
    ppt2md(filename: string): Promise<string>;
    private getPresentationXml;
    private extractSlideIds;
    private processSlide;
    extractParagraphsFromSlide(slideXml: string): string[];
    formatToMarkdown(documentContent: any[]): string;
}
/**
 * 将PPT文件解析并转换为md格式
 * @param filename PPT文件路径
 * @returns Markdown格式的字符串
 */
export declare function parse(filename: string): Promise<string>;
