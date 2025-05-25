/**
 * 定义聊天历史记录的类型
 * @property {string} id - 唯一标识
 * @property {string} reasoning - 推理信息
 * @property {string} role - 角色
 * @property {string} content - 聊天内容
 * @property {string[]} images - 图片数组
 * @property {string} tool_calls - 工具调用信息
 * @property {string} created_at - 创建时间字符串
 * @property {number} create_time - 创建时间戳
 * @property {object} stat - 统计信息
 * @property {number} tokens - tokens 数量
 */
export type ChatHistory = {
    id: string;
    compare_id: string;
    reasoning: any;
    role: string;
    content: any;
    images: string[];
    doc_files: string[];
    tool_calls: string;
    created_at: string;
    create_time: number;
    stat: any;
    tokens: number;
    search_result: any[];
    search_type: string | undefined | null;
    search_query: string | undefined | null;
    tools_result?: any[];
};
/**
 * 定义聊天上下文的类型
 * @property {string} role - 角色
 * @property {string} content - 聊天内容
 * @property {string[]} images - 图片数组
 * @property {string[]} doc_files - 文档文件数组
 * @property {string} tool_calls - 工具调用信息
 */
export type ChatContext = {
    role: string;
    content: string;
    images?: string[];
    doc_files?: string[];
    tool_calls?: string;
};
/**
 * 定义模型信息的类型
 * @typedef {Object} ModelInfo
 * @property {string} model - 模型名称
 * @property {number} size - 模型大小
 * @property {number} contextLength - 模型的上下文长度
 */
export type ModelInfo = {
    title: string;
    supplierName: string;
    model: string;
    size: number;
    capability?: string[];
    contextLength: number;
};
/**
 * 聊天服务类，提供与聊天对话相关的各种操作
 */
export declare class ChatService {
    /**
     * 根据 UUID 获取上下文路径
     * @param {string} uuid - 对话的唯一标识符
     * @returns {string} - 上下文路径
     */
    private getContextPath;
    /**
     * 根据 UUID 获取对话配置文件的完整路径
     * @param {string} uuid - 对话的唯一标识符
     * @returns {string} - 配置文件的完整路径
     */
    private getConfigFilePath;
    /**
     * 根据 UUID 获取对话历史记录文件的完整路径
     * @param {string} uuid - 对话的唯一标识符
     * @returns {string} - 历史记录文件的完整路径
     */
    private getHistoryFilePath;
    /**
     * 读取指定路径的 JSON 文件并解析为对象
     * @param {string} filePath - 文件的完整路径
     * @returns {any} - 解析后的 JSON 对象，如果文件不存在或解析失败则返回空数组
     */
    private readJsonFile;
    /**
     * 将数据保存为 JSON 文件到指定路径
     * @param {string} filePath - 文件的完整路径
     * @param {any} data - 要保存的数据
     */
    private saveJsonFile;
    /**
     * 创建一个新的聊天对话
     * @param {string} model - 使用的模型名称
     * @param {string} parameters - 模型的参数
     * @param {string} [title=""] - 对话的标题，默认为空字符串
     * @param {string} supplierName - 供应商名称
     * @returns {object} - 包含对话配置信息的对象
     */
    create_chat(model: string, parameters: string, title: string, supplierName: string, agent_name: string): object;
    /**
     * 更新指定对话的模型信息
     * @param {string} uuid - 对话的唯一标识符
     * @param {string} model - 新的模型名称
     * @param {string} parameters - 新的模型参数
     * @param {string} supplierName - 供应商名称
     * @returns {boolean} - 如果更新成功返回 true，否则返回 false
     */
    update_chat_model(uuid: string, model: string, parameters: string, supplierName: string): boolean;
    /**
     * 读取指定对话的配置信息
     * @param {string} uuid - 对话的唯一标识符
     * @returns {any} - 对话的配置信息对象，如果不存在则返回空数组
     */
    read_chat(uuid: string): any;
    /**
     * 保存指定对话的配置信息
     * @param {string} uuid - 对话的唯一标识符
     * @param {object} chatConfig - 要保存的对话配置信息对象
     */
    save_chat(uuid: string, chatConfig: object): void;
    /**
     * 合并聊天历史记录
     * @param {ChatHistory[]} chatHistory - 聊天历史记录数组
     * @returns {ChatHistory[]} - 合并后的聊天历史记录数组
     */
    mergeHistory(chatHistory: ChatHistory[]): ChatHistory[];
    /**
     * 检查聊天历史记录，确保顺序正确
     * @param {ChatHistory[]} chatHistory - 聊天历史记录数组
     * @returns {ChatHistory[]} - 检查后的聊天历史记录数组
     */
    checkHistory(chatHistory: ChatHistory[]): ChatHistory[];
    /**
     * 格式化聊天历史记录，将同一对话的历史记录合并
     * @param {ChatHistory[]} chatHistory - 聊天历史记录数组
     * @returns {any} - 格式化后的聊天历史记录数组
     */
    formatHistory(chatHistory: ChatHistory[]): any;
    /**
     * 读取指定对话的历史记录
     * @param {string} uuid - 对话的唯一标识符
     * @returns {any[]} - 对话的历史记录数组，如果不存在则返回空数组
     */
    read_history(uuid: string): any[];
    /**
     * 保存指定对话的历史记录
     * @param {string} uuid - 对话的唯一标识符
     * @param {any[]} history - 要保存的历史记录数组
     */
    save_history(uuid: string, history: any[]): void;
    /**
     * 获取所有对话的列表，并按创建时间降序排序
     * @returns {object[]} - 包含所有对话配置信息的数组
     */
    get_chat_list(): object[];
    /**
     * 获取指定对话的历史记录
     * @param {string} uuid - 对话的唯一标识符
     * @returns {object[]} - 对话的历史记录数组
     */
    get_chat_history(uuid: string): object[];
    /**
     * 处理文档和图片文件
     * @param chatContext <ChatContext> 聊天上下文
     * @param isVision <boolean> 是否是视觉模型
     * @param uuid <string> 对话的唯一标识符
     */
    handle_files(chatContext: ChatContext, isVision: boolean): Promise<ChatContext>;
    /**
     * 构造传递给模型的历史对话记录，根据上下文长度进行截断
     * @param {string} uuid - 对话的唯一标识符
     * @param {ChatContext} chatContext - 当前的聊天上下文
     * @param {number} contextLength - 上下文的最大长度
     * @param {boolean} isTempChat - 是否是临时聊天
     * @param {boolean} isVision - 是否是视觉模型
     * @returns {object[]} - 构造后的历史对话记录数组
     */
    build_chat_history(uuid: string, chatContext: ChatContext, contextLength: number, isTempChat: boolean, isVision: boolean): Promise<any[]>;
    /**
     * 保存对话的历史记录，并根据上下文长度进行截断
     * @param {string} uuid - 对话的唯一标识符
     * @param {ChatHistory} history - 要保存的聊天历史记录
     * @param {number} contextLength - 上下文的最大长度
     */
    save_chat_history(uuid: string, history: ChatHistory, historyRes: ChatHistory, contextLength: number, regenerate_id: string | undefined): void;
    /**
     * 修正对话的历史记录
     * @param uuid <string> 对话的唯一标识符
     * @param id <string> 要修正的历史记录的唯一标识符
     * @param history <ChatHistory> 修正后的聊天历史记录
     */
    set_chat_history(uuid: string, id: string, history: ChatHistory): void;
    /**
     * 删除指定对话及其相关文件
     * @param {string} uuid - 对话的唯一标识符
     */
    delete_chat(uuid: string): void;
    /**
     * 更新指定对话的标题
     * @param {string} uuid - 对话的唯一标识符
     * @param {string} title - 新的对话标题
     * @returns {boolean} - 如果更新成功返回 true，否则返回 false
     */
    update_chat_title(uuid: string, title: string): boolean;
    /**
     * 更新指定对话的配置项
     * @param {string} uuid - 对话的唯一标识符
     * @param {string} key - 配置项的键
     * @param {any} value - 配置项的值
     * @returns {boolean} - 如果更新成功返回 true，否则返回 false
     */
    update_chat_config(uuid: string, key: string, value: any): boolean;
    /**
     * 删除指定对话中的某条历史记录
     * @param {string} uuid - 对话的唯一标识符
     * @param {string} id - 要删除的历史记录的唯一标识符
     */
    delete_chat_history(uuid: string, id: string): void;
    /**
     * 获取指定对话的最后一条历史记录
     * @param {string} uuid - 对话的唯一标识符
     * @returns {object} - 最后一条历史记录对象，如果不存在则返回空对象
     */
    get_last_chat_history(uuid: string): object;
}
/**
 * 导出 ChatService 类的单例实例
 */
export declare const chatService: ChatService;
