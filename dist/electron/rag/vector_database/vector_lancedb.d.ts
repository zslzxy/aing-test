import * as lancedb from '@lancedb/lancedb';
interface QueryResult {
    id: string;
    doc: string;
    docId?: string;
    keywords?: string[];
    score: number;
    vectorScore: number;
    keywordScore: number;
}
interface DocumentMetadata {
    id: string;
    doc: string;
    docId?: string;
    keywords?: string[];
}
/**
 * LanceDB向量数据库管理类
 */
export declare class LanceDBManager {
    private static readonly DIMENSION;
    private static readonly ENABLE_METRICS;
    static connect(dbPath?: string): Promise<lancedb.Connection>;
    static optimizeTable(tableName: string): Promise<any>;
    static optimizeAllTable(): Promise<void>;
    /**
     * 确保数据库目录存在
     */
    private static ensureDatabaseDirectory;
    /**
     * 开始性能监控
     * @param operation 操作名称
     * @returns 性能指标对象
     */
    private static startMetrics;
    /**
     * 结束性能监控并输出结果
     * @param metrics 性能指标对象
     */
    private static endMetrics;
    private static getEmbeddingCachePath;
    /**
     * 清理过期的向量缓存
     */
    static clearExpiredCache(): Promise<void>;
    /**
     * 获取向量缓存
     * @param key 缓存键
     * @returns number[]
     */
    private static getEmbeddingCache;
    /**
     * 设置向量缓存
     * @param key <string> 缓存键
     * @param embedding <number[]> 向量嵌入
     * @returns void
     */
    private static setEmbeddingCache;
    /**
     * 获取文本的向量嵌入
     * @param supplierName 供应商名称
     * @param model 使用的模型名称
     * @param text 需要嵌入的文本
     * @returns 向量嵌入
     * @throws 如果嵌入生成失败或维度不匹配
     */
    private static getEmbedding;
    /**
     * 检查表是否存在
     * @param db LanceDB连接
     * @param table 表名
     * @returns 表是否存在
     */
    private static tableExists;
    /**
     * 创建表
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param initialText 初始文本
     * @returns 成功创建的表名
     */
    static createTable(tableName: string, supplierName: string, model: string, initialText: string): Promise<string>;
    /**
     * 自定义创建表
     * @param tableName 表名
     * @param tableStruct 表结构
     * @param indexKeys 索引 示例：[{key:'msg',type:'ivfPq'},{key:'docId',type:'btree'}]
     * @returns boolean
     */
    static createTableAt(tableName: string, tableStruct: any[], indexKeys: any[]): Promise<boolean>;
    /**
     * 创建FTS索引
     * @param tableName 表名
     * @returns boolean
     */
    static createDocFtsIndex(tableName: string): Promise<void>;
    /**
     * 添加索引
     * @param tableName 表名
     * @param indexKeys 索引 示例：[{key:'msg',type:'ivfPq'},{key:'docId',type:'btree'}]
     * @returns boolean
     */
    static addIndex(tableName: string, indexKeys: any[]): Promise<boolean>;
    /**
     * 删除索引
     * @param tableName 表名
     * @param indexKey <string> 索引 key
     * @returns boolean
     */
    static deleteIndex(tableName: string, indexKey: string): Promise<boolean>;
    /**
     * 向表中添加文档
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param text 要添加的文本
     * @returns 添加的记录ID
     */
    static addDocument(tableName: string, supplierName: string, model: string, text: string, keywords: string[], docId: string, tokens: string): Promise<string>;
    static checkColumn(tableObj: lancedb.Table, recordInfo: any): Promise<boolean>;
    /**
     * 通用添加文档
     * @param tableName 表名
     * @param record 要添加的记录
     * @returns boolean
     */
    static addRecord(tableName: string, record: any[]): Promise<boolean>;
    static openTable(tableName: string): Promise<lancedb.Table>;
    /**
     * 通用更新文档
     * @param tableName 表名
     * @param record 要更新的记录
     * @returns boolean
     * @example
     * await LanceDBManager.updateRecord('test', { where:'id=1',values:{name:'test1',age:20} });
     */
    static updateRecord(tableName: string, record: any): Promise<boolean>;
    /**
     * 通用删除文档
     * @param tableName 表名
     * @param where 删除条件
     * @returns boolean
     */
    static deleteRecord(tableName: string, where: string): Promise<boolean>;
    /**
     * 通用查询文档
     * @param tableName 表名
     * @param where 查询条件
     * @returns 查询结果
     */
    static queryRecord(tableName: string, where: string, field?: string[]): Promise<any[]>;
    /**
     * 通用查询指定表的总行数
     * @param tableName 表名
     * @param where 查询条件
     * @returns 查询结果
     */
    static tableCount(tableName: string): Promise<number>;
    /**
     * 批量添加文档
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param texts 文本数组
     * @returns 添加的记录数量
     */
    static addDocuments(tableName: string, supplierName: string, model: string, texts: string[], keywords: string[][], docId: string): Promise<number>;
    /**
     * 执行向量搜索
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param queryText 查询文本
     * @param limit 结果数量限制
     * @returns 查询结果
     */
    static search(tableName: string, supplierName: string, model: string, queryText: string, limit?: number): Promise<QueryResult[]>;
    static hybridSearchByNew(tableName: string, ragInfo: {
        ragName: string;
        ragDesc: string;
        ragCreateTime: number;
        supplierName: string;
        embeddingModel: string;
        searchStrategy: number;
        maxRecall: number;
        recallAccuracy: number;
        resultReordering: number;
        rerankModel: string;
        queryRewrite: number;
        vectorWeight: number;
        keywordWeight: number;
    }, queryText: string, keywords?: string[]): Promise<QueryResult[]>;
    /**
     * 执行混合搜索（向量相似度 + 关键词匹配）
     * 优化版本：减少重复计算和数据库查询次数，提升性能
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param queryText 查询文本
     * @param keywords 关键词数组
     * @param limit 结果数量限制
     * @param vectorWeight 向量搜索权重 (0-1)
     * @param keywordWeight 关键词匹配权重 (0-1)
     * @returns 查询结果
     */
    static hybridSearch(tableName: string, ragInfo: {
        ragName: string;
        ragDesc: string;
        ragCreateTime: number;
        supplierName: string;
        embeddingModel: string;
        searchStrategy: number;
        maxRecall: number;
        recallAccuracy: number;
        resultReordering: number;
        rerankModel: string;
        queryRewrite: number;
        vectorWeight: number;
        keywordWeight: number;
    }, queryText: string, keywords?: string[]): Promise<QueryResult[]>;
    /**
     * 规范化权重确保它们的总和为1
     */
    private static normalizeWeights;
    /**
     * 预热查询提高性能
     */
    private static preWarmQuery;
    private static ToCosineIndex;
    /**
     * 执行向量搜索
     */
    private static performVectorSearch;
    /**
     * 执行关键词搜索
     */
    private static performKeywordSearch;
    /**
     * 构建关键词查询条件
     */
    private static buildKeywordConditions;
    /**
     * 计算关键词匹配分数
     * 优先考虑匹配的关键词数量，其次考虑关键词出现的总次数
     */
    private static calculateKeywordScore;
    /**
     * 排序结果并限制数量
     */
    private static sortResults;
    /**
     * 优化文档内容 - 对切片长度接近原文的情况使用完整文档
     */
    private static optimizeDocumentContent;
    /**
     * 格式化结果为标准输出格式
     */
    private static formatResults;
    /**
     * 获取文档信息
     * @param docIdList - 文档ID列表
     * @returns 文档ID到文档名称的映射
     */
    private static getDocName;
    /**
     * 获取表中的所有文档
     * @param tableName 表名
     * @returns 表中的所有文档
     */
    static getAllDocuments(tableName: string): Promise<DocumentMetadata[]>;
    /**
     * 获取表中的记录数量
     * @param tableName 表名
     * @returns 记录数量
     */
    static getDocumentCount(tableName: string): Promise<number>;
    /**
     * 删除表
     * @param tableName 表名
     * @returns 成功与否
     */
    static dropTable(tableName: string): Promise<boolean>;
    /**
     * 获取所有表名
     * @returns 所有表名列表
     */
    static listTables(): Promise<string[]>;
    /**
     * 从表中删除指定ID的文档
     * @param tableName 表名
     * @param docId 文档ID
     * @returns 成功删除的记录数
     */
    static deleteDocument(tableName: string, docId: string): Promise<number>;
    /**
     * 获取数据库状态信息
     * @returns 数据库状态信息
     */
    static getDatabaseStats(): Promise<{
        dbPath: string;
        tables: number;
        totalDocuments: number;
        tableDetails: {
            name: string;
            documents: number;
        }[];
    }>;
    /**
   * 执行高级关键词搜索
   * 通过文本分析和标记化提供更精确的关键词匹配
   * @param tableName 表名
   * @param keywords 关键词数组
   * @param options 搜索选项
   * @returns 搜索结果
   */
    static keywordSearch(tableName: string, keywords: string[], options?: {
        limit?: number;
        matchMode?: 'any' | 'all' | 'phrase';
        caseSensitive?: boolean;
        boostField?: string;
        fuzzyMatch?: boolean;
    }): Promise<QueryResult[]>;
}
export {};
