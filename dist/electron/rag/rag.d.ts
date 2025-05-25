export declare const getDefaultPrompt: (query: string, model: string) => {
    userPrompt: string;
    systemPrompt: string;
    searchResultList: any;
    query: string;
};
export declare class Rag {
    private docTable;
    /**
     * 解析文档
     * @param filename:string 文件名
     * @param ragName:string rag名称
     * @returns Promise<any>
     */
    parseDocument(filename: string, ragName: string, saveToFile?: boolean): Promise<any>;
    /**
     * 检查文档表是否存在
     * @returns Promise<boolean>
     */
    checkDocTable(tableName: string): Promise<boolean>;
    checkDocTableSchema(tableName: string): Promise<boolean>;
    /**
     * 创建文档表
     * @returns Promise<any>
     */
    createDocTable(tableName: string): Promise<boolean>;
    /**
     * 生成文档关键词
     * @param doc:string 文档内容
     * @param num:number 关键词数量，默认为5
     * @returns Promise<string[]> 提取的关键词数组
     */
    generateKeywords(doc: string, num?: number): Promise<string[]>;
    /**
     * 生成文档摘要
     * @param doc:string 文档内容
     * @returns Promise<string>
     * @example
     * let abstract = await rag.generateAbstract(doc);
     */
    generateAbstract(doc: string): Promise<string>;
    getDocNameByDocId(docId: string): Promise<string>;
    /**
     * 删除指定文档
     * @param ragName <string> rag名称
     * @param docId <string> 文档ID
     * @returns Promise<any>
     */
    removeRagDocument(ragName: string, docId: string): Promise<any>;
    /**
     * 删除指定知识库
     * @param ragName <string> rag名称
     * @returns Promise<any>
     */
    removeRag(ragName: string): Promise<any>;
    /**
     * 将文档添加到数据库
     * @param filename:string 文件名
     * @param ragName:string rag名称
     * @returns Promise<any>
     */
    addDocumentToDB(filename: string, ragName: string, separators: string[], chunkSize: number, overlapSize: number): Promise<any>;
    /**
     * 从数据库中删除文档
     * @param docId:string 文档ID
     * @returns Promise<any>
     */
    deleteDocumentFromDB(docId: string): Promise<any>;
    /**
     * 获取知识库信息
     * @param  ragName:string 知识库名称
     * @returns Promise<any>
     */
    getRagInfo(ragName: string): Promise<any>;
    /**
     * 检索文档
     * @param ragList:string[] rag列表
     * @param queryText:string 查询文本
     * @returns Promise<any>
     */
    searchDocument(ragList: string[], queryText: string): Promise<any>;
    private cutRagResult;
    /**
     * 检索并拼接提示词
     * @param ragList:string[] rag列表
     * @param model:string 模型名称
     * @param queryText:string 查询文本
     * @param doc_files:string[] 文档内容列表
     * @param agent_name <string> 智能体名称
     * @returns Promise<{ userPrompt: string; systemPrompt: string;searchResultList:any,query:string }>
     */
    searchAndSuggest(supplierName: string, model: string, queryText: string, doc_files: string[], agent_name: string, rag_results?: any[], ragList?: string[]): Promise<{
        userPrompt: string;
        systemPrompt: string;
        searchResultList: any;
        query: string;
    }>;
    /**
     * 重新生成文档索引
     * @param ragName:string 知识库名称
     * @param docId:string 文档ID
     * @returns Promise<any>
     */
    reindexDocument(ragName: string, docId: string): Promise<boolean>;
    /**
     * 重新生成知识库索引
     * @param ragName:string 知识库名称
     * @returns Promise<any>
     */
    reindexRag(argName: string): Promise<boolean>;
    /**
     * 获取文档分片列表
     * @param ragName:string 知识库名称
     * @param docId:string 文档ID
     * @returns Promise<any[]>
     */
    getDocChunkList(ragName: string, docId: string): Promise<any[]>;
}
