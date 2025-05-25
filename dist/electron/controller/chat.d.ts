/**
 * chat controller 类，处理与聊天相关的各种操作
 * @class
 */
declare class ChatController {
    /**
     * 获取对话列表
     * @returns {Promise<any>} - 包含对话列表的成功响应
     */
    get_chat_list(): Promise<any>;
    /**
     * 创建新的对话
     * @param {Object} args - 创建对话所需的参数
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.title - 对话标题
     * @param {string} args.supplierName - 供应商名称
     * @returns {Promise<any>} - 包含新对话信息的成功响应
     */
    create_chat(args: {
        model: string;
        parameters: string;
        title: string;
        supplierName?: string;
        agent_name?: string;
    }): Promise<any>;
    /**
     * 获取常用模型TOP5
     * @param result
     * @returns
     */
    get_model_top5(result: any): any;
    /**
     * 获取模型列表
     * @returns {Promise<any>} - 包含模型列表信息的成功响应
     */
    get_model_list(): Promise<any>;
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
    /**
     * 获取指定对话信息
     * @param {Object} args - 获取对话信息所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 包含对话信息的成功响应
     */
    get_chat_info(args: {
        context_id: string;
    }): Promise<any>;
    /**
     * 删除指定对话
     * @param {Object} args - 删除对话所需的参数
     * @param {string} args.context_id - 对话的唯一标识符,多个用逗号分隔
     * @returns {Promise<any>} - 删除成功的响应
     */
    remove_chat(args: {
        context_id: string;
    }): Promise<any>;
    /**
     * 修改对话标题
     * @param {Object} args - 修改对话标题所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.title - 新的对话标题
     * @returns {Promise<any>} - 修改结果的响应
     */
    modify_chat_title(args: {
        context_id: string;
        title: string;
    }): Promise<any>;
    /**
     * 删除指定对话历史
     * @param {Object} args - 删除对话历史所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.id - 要删除的历史记录的唯一标识符
     * @returns {Promise<any>} - 删除成功的响应
     */
    delete_chat_history(args: {
        context_id: string;
        id: string;
    }): Promise<any>;
    /**
     * 中断生成
     * @param {Object} args - 中断生成所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 中断成功的响应
     */
    stop_generate(args: {
        context_id: string;
    }): Promise<any>;
    /**
     * 获取指定对话的最后一条历史记录
     * @param {Object} args - 获取最后一条历史记录所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 包含最后一条历史记录的成功响应
     */
    get_last_chat_history(args: {
        context_id: string;
    }): Promise<any>;
}
export default ChatController;
