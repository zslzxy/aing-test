export declare class RagTask {
    private docTable;
    /**
     * 获取未解析文档
     * @returns Promise<any>
     */
    getNotParseDocument(): Promise<any>;
    getNotEmbeddingDocument(): Promise<any>;
    /**
     * 文档分割 - 将长文本分割成小块，尊重Markdown文档结构
     * @param docBody 待分割的文档内容
     * @returns 分割后的文本块数组
     */
    docChunk(docBody: string, chunkSize: number, overlapSize: number): string[];
    /**
     * 辅助方法：按大小分割文本
     */
    private splitTextBySize;
    recursionSplit(chunkList: string[], separators: string[], chunkSize: number, currentSep: string, overlapSize: number): string[];
    split(text: string, sep: any): string[];
    defaultSeparators(separators: string[], filename: string, text: string): string[];
    formatSep(sep: string[]): any[];
    getDocName(filename: string): string;
    /**
     *
     * @param text <string> 文本内容
     * @param separators <string[]> 分隔符列表
     * @param chunkSize <number> 每个块的大小
     * @returns
     */
    splitText(filename: string, text: string, separators: string[], chunkSize: number, overlapSize?: number): string[];
    parseTask(): Promise<void>;
    switchToCosineIndex(): Promise<void>;
    /**
     * 解析文档
     * @returns Promise<void>
     */
    parse(): Promise<void>;
    /**
     * 开始嵌入文档
     * @returns Promise<string>
     */
    embed(): Promise<any>;
}
