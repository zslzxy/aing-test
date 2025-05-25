import { ChatHistory, ModelInfo } from './chat';
/**
 * 存储所有模型信息的数组
 * @type {ModelInfo[]}
 */
export declare let ModelListInfo: ModelInfo[];
/**
 * 存储对话上下文状态的映射，键为对话ID，值为是否继续生成的布尔值
 * @type {Map<string, boolean>}
 */
export declare let ContextStatusMap: Map<string, boolean>;
export declare const clearModelListInfo: () => void;
export declare class ToChatService {
    /**
     * 获取指定模型的信息
     * @param {string} model - 模型名称
     * @returns {ModelInfo} - 模型信息对象
     */
    get_model_info(model: string): ModelInfo;
    /**
     * 判断是否为视觉模型
     * @param {string} supplierName - 供应商名称
     * @param {string} model - 模型名称
     * @returns {Promise<boolean>} - 是否为视觉模型
     */
    isVisionModel(supplierName: string, model: string): Promise<boolean>;
    /**
     * 保存对话内容
     * @param {string} uuid - 对话的唯一标识符
     * @param {string} resUUID - 对话的唯一标识符
     * @param {ChatHistory} chatHistoryRes - 对话历史记录
     */
    set_chat_history(uuid: string, resUUID: string, chatHistoryRes: ChatHistory): Promise<void>;
    /**
     * 确保消息格式正确
     * @param {any} messages - 消息内容
     * @returns
     */
    formatMessage(messages: any[]): any[];
    /**
     * 开始对话
     * @param {Object} args - 对话所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.supplierName - 供应商名称
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.user_content - 用户输入的内容
     * @param {string} args.search - 搜索类型
     * @param {string} args.rag_list - RAG列表
     * @param {string} args.regenerate_id - 重新生成的ID
     * @param {string} args.images - 图片列表
     * @param {string} args.doc_files - 文件列表
     * @param {string} args.temp_chat - 临时对话标志
     * @param {any} args.rag_results - RAG结果列表
     * @param {any} args.search_results - 搜索结果列表
     * @param {string} args.compare_id - 对比ID
     * @param {any} event - 事件对象，用于处理HTTP响应
     * @returns {Promise<any>} - 可读流，用于流式响应对话结果
     */
    chat(args: {
        context_id: string;
        supplierName?: string;
        model: string;
        parameters?: string;
        user_content: string;
        rag_results: any[];
        search_results?: any[];
        search?: string;
        rag_list?: string;
        regenerate_id?: string;
        images?: string;
        doc_files?: string;
        temp_chat?: string;
        compare_id?: string;
        mcp_servers?: string[];
    }, event: any): Promise<any>;
}
