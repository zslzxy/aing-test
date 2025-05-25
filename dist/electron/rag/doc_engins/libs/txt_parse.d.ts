/**
 * 开始解析(此函数为统一入口，其它同类模块也使用此函数名作为入口)
 * @param filename txt文件路径
 * @returns 处理后的txt内容
 */
export declare function parse(filename: string, ragName: string): Promise<string>;
