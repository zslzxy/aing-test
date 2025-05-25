import { ChatContext, ChatHistory } from './chat';
/**
 * 聊天服务类，提供与聊天对话相关的各种操作
 */
export declare class ShareChatService {
    /**
     * 获取对话的上下文路径
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @returns {string} - 上下文路径
     */
    private getContextPath;
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
     * 根据 UUID 获取对话配置文件的完整路径
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @returns {string} - 配置文件的完整路径
     */
    private getConfigFilePath;
    /**
     * 获取对话历史记录文件的完整路径
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @returns {string} - 历史记录文件的完整路径
     */
    private getHistoryFilePath;
    get_share_info(shareId: string): any;
    /**
     * 创建一个新的聊天对话
     * @param {string} shareId - 分享ID
     * @param {string} [title=""] - 对话的标题，默认为空字符串
     * @returns {object} - 包含对话配置信息的对象
     */
    create_chat(shareId: string, title?: string): object;
    /**
     * 更新指定对话的模型信息
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @param {string} model - 新的模型名称
     * @param {string} parameters - 新的模型参数
     * @param {string} supplierName - 供应商名称
     * @returns {boolean} - 如果更新成功返回 true，否则返回 false
     */
    update_chat_model(shareId: string, contextId: string, model: string, parameters: string, supplierName: string): boolean;
    /**
     * 更新指定对话的配置项
     * @param {string} shareId - 对话的唯一标识符
     * @param {string} key - 配置项的键
     * @param {any} value - 配置项的值
     * @returns {boolean} - 如果更新成功返回 true，否则返回 false
     */
    update_chat_config(shareId: string, contextId: string, key: string, value: any): boolean;
    /**
     * 读取指定对话的配置信息
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @returns {any} - 对话的配置信息对象，如果不存在则返回空数组
     */
    read_chat(shareId: string, contextId: string): any;
    /**
     * 保存指定对话的配置信息
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @param {object} chatConfig - 要保存的对话配置信息对象
     */
    save_chat(shareId: string, contextId: string, chatConfig: object): void;
    /**
     * 读取指定对话的历史记录
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @returns {any[]} - 对话的历史记录数组，如果不存在则返回空数组
     */
    read_history(shareId: string, contextId: string): any[];
    /**
     * 保存指定对话的历史记录
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @param {any[]} history - 要保存的历史记录数组
     */
    save_history(shareId: string, contextId: string, history: any[]): void;
    /**
     * 获取所有对话的列表，并按创建时间降序排序
     * @param {string} shareId - 分享ID
     * @returns {object[]} - 包含所有对话配置信息的数组
     */
    get_chat_list(shareId: string): object[];
    /**
     * 获取指定对话的历史记录
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @returns {object[]} - 对话的历史记录数组
     */
    get_chat_history(shareId: string, contextId: string): object[];
    /**
     * 构造传递给模型的历史对话记录，根据上下文长度进行截断
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @param {ChatContext} chatContext - 当前的聊天上下文
     * @param {number} contextLength - 上下文的最大长度
     * @returns {object[]} - 构造后的历史对话记录数组
     */
    build_chat_history(shareId: string, contextId: string, chatContext: ChatContext, contextLength: number): any[];
    /**
     * 保存对话的历史记录，并根据上下文长度进行截断
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @param {ChatHistory} history - 要保存的聊天历史记录
     * @param {ChatHistory} historyRes - 聊天历史记录响应
     * @param {number} contextLength - 上下文的最大长度
     */
    save_chat_history(shareId: string, contextId: string, history: ChatHistory, historyRes: ChatHistory, contextLength: number, regenerate_id: string | any): void;
    /**
     * 修正对话的历史记录
     * @param shareId <string> 分享ID
     * @param contextId <string> 对话的唯一标识符
     * @param id <string> 要修正的历史记录的唯一标识符
     * @param history <ChatHistory> 修正后的聊天历史记录
     */
    set_chat_history(shareId: string, contextId: string, id: string, history: ChatHistory): void;
    /**
     * 删除指定对话及其相关文件
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     */
    delete_chat(shareId: string, contextId: string): void;
    /**
     * 更新指定对话的标题
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @param {string} title - 新的对话标题
     * @returns {boolean} - 如果更新成功返回 true，否则返回 false
     */
    update_chat_title(shareId: string, contextId: string, title: string): boolean;
    /**
     * 删除指定对话中的某条历史记录
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @param {string} id - 要删除的历史记录的唯一标识符
     */
    delete_chat_history(shareId: string, contextId: string, id: string): void;
    /**
     * 获取指定对话的最后一条历史记录
     * @param {string} shareId - 分享ID
     * @param {string} contextId - 对话的唯一标识符
     * @returns {object} - 最后一条历史记录对象，如果不存在则返回空对象
     */
    get_last_chat_history(shareId: string, contextId: string): object;
}
/**
 * 导出 ShareChatService 类的单例实例
 */
export declare const shareChatService: ShareChatService;
