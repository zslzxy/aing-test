/**
 * rag controller 类，负责管理知识库的相关操作
 * @class
 */
declare class RagController {
    /**
     * 获取知识库状态
     * @returns {Promise<any>} - 知识库状态
     */
    rag_status(): Promise<import("../class/public").ReturnMsg>;
    /**
     * 获取嵌套模型列表
     * @returns {Promise<any>} - 嵌套模型列表
     */
    get_embedding_models(): Promise<import("../class/public").ReturnMsg>;
    /**
     * 创建知识库
     * @param {string} ragName - 知识库名称
     * @param {string} ragDesc - 知识库描述
     * @returns {Promise<any>} - 创建结果
     */
    create_rag(args: {
        ragName: string;
        ragDesc: string;
        enbeddingModel?: string;
        supplierName?: string;
        searchStrategy: number;
        maxRecall: number;
        recallAccuracy: number;
        resultReordering: number;
        rerankModel: string;
        queryRewrite: number;
        vectorWeight: number;
        keywordWeight: number;
        savePath?: string;
    }): Promise<any>;
    /**
     * 删除知识库
     * @param {string} ragName - 知识库名称
     * @returns {Promise<any>} - 删除结果
     */
    remove_rag(args: {
        ragName: string;
    }): Promise<any>;
    /**
     * 获取嵌套模型MAP
     * @returns {Promise<any>} - 嵌套
     */
    get_embedding_map(): Promise<Map<string, Map<string, Boolean>>>;
    /**
     * 获取知识库列表
     * @returns {Promise<any>} - 知识库列表
     */
    get_rag_list(): Promise<any>;
    /**
     * 修改知识库信息
     * @param {string} args.ragName - 知识库名称
     * @param {string} args.ragDesc - 知识库描述
     * @param {object} args.options - 其他选项
     * @returns {Promise<any>} - 修改结果
     */
    modify_rag(args: {
        ragName: string;
        ragDesc: string;
        searchStrategy?: number;
        maxRecall?: number;
        recallAccuracy?: number;
        resultReordering?: number;
        rerankModel?: string;
        queryRewrite?: number;
        vectorWeight?: number;
        keywordWeight?: number;
    }): Promise<any>;
    /**
     * 上传知识库文档
     * @param {string} ragName - 知识库名称
     * @param {string} filePath - 文件路径 JSON列表
     * @returns {Promise<any>} - 上传结果
     */
    upload_doc(args: {
        ragName: string;
        filePath: string;
        separators?: string[];
        chunkSize?: number;
        overlapSize?: number;
    }): Promise<any>;
    /**
     * 获取知识库文档列表
     * @param {string} ragName - 知识库名称
     * @returns {Promise<any>} - 文件列表
     */
    get_rag_doc_list(args: {
        ragName: string;
    }): Promise<any>;
    /**
     * 获取知识库文档内容
     * @param {string} ragName - 知识库名称
     * @param {string} docName - 文档名称
     * return {Promise<any>} - 文档内容
     */
    get_doc_content(args: {
        ragName: string;
        docName: string;
    }): Promise<any>;
    /**
     * 下载知识库文档
     * @param {string} ragName - 知识库名称
     * @param {string} docName - 文档名称
     * @returns {Promise<any>} - 文件下载流
     */
    download_doc(args: {
        ragName: string;
        docName: string;
    }, event: any): Promise<any>;
    remove_doc(args: {
        ragName: string;
        docIdList: string;
    }): Promise<any>;
    /**
     * 重新生成文档索引
     * @param args
     * @param args.ragName <string> 知识库名称
     * @param args.docName <string> 文档名称
     * @returns
     */
    reindex_document(args: {
        ragName: string;
        docId: string;
    }): Promise<any>;
    /**
     * 重新生成知识库索引
     * @param args
     * @param args.ragName <string> 知识库名称
     * @returns
     */
    reindex_rag(args: {
        ragName: string;
    }): Promise<any>;
    /**
     * 检索知识库
     * @param args
     * @param args.ragName <string> 知识库名称
     * @param args.queryText <string> 查询文本
     * @returns
     */
    search_document(args: {
        ragList: string;
        queryText: string;
    }): Promise<any>;
    /**
     * 获取图片
     * @param args
     * @param args.r <string> 知识库名称
     * @param args.n <string> 图片名称
     * @returns
     */
    images(args: {
        r: string;
        n: string;
    }, event: any): Promise<any>;
    /**
     * 测试分块
     * @param args
     * @param args.filename <string> 文件名
     * @param args.chunkSize <number> 块大小
     * @param args.overlapSize <number> 重叠大小
     * @param args.separators <string[]> 分隔符
     * @returns
     */
    test_chunk(args: {
        filename: string;
        chunkSize: number;
        overlapSize: number;
        separators: string[];
    }): Promise<any>;
    optimize_table(args: {
        ragName: string;
    }): Promise<any>;
    /**
     * 获取文档分块列表
     * @param args
     * @param args.ragName <string> 知识库名称
     * @param args.docId <string> 文档ID
     * @returns
     **/
    get_doc_chunk_list(args: {
        ragName: string;
        docId: string;
    }): Promise<any>;
}
export default RagController;
