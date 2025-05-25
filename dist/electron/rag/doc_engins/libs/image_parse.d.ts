/**
 * 将图片中的文字解析并转换为Markdown格式
 * @param filename 图片文件路径
 * @returns Markdown格式的字符串
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
