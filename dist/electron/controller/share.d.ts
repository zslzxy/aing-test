/**
 * share controller 类，处理与对话分享相关的各种操作
 * @class
 */
declare class ShareController {
    /**
     * 获取指定分享配置文件的完整路径
     * @param {string} shareId - 分享ID
     * @returns {string} - 分享配置文件的完整路径
     */
    private getShareConfigFilePath;
    /**
     * 获取分享上下文目录的完整路径
     * @param {string} shareId - 分享ID
     * @returns {string} - 分享上下文目录的完整路径
     */
    private getShareContextPath;
    /**
     * 读取指定路径的文件内容并解析为 JSON 对象
     * @param {string} filePath - 文件的完整路径
     * @returns {object|null} - 解析后的 JSON 对象，如果文件不存在或解析失败则返回 null
     */
    private readJsonFile;
    /**
     * 将数据保存为 JSON 文件到指定路径
     * @param {string} filePath - 文件的完整路径
     * @param {object} data - 要保存的数据
     */
    private saveJsonFile;
    /**
     * 获取指定分享配置
     * @param {string} shareId - 分享ID
     * @returns {object|null} - 分享配置对象，如果不存在则返回 null
     */
    read_share_config(shareId: string): object | null;
    /**
     * 获取分享列表
     * @returns {Promise<any>} - 包含分享列表的成功响应对象
     */
    get_share_list(): Promise<import("../class/public").ReturnMsg>;
    /**
     * 删除指定分享
     * @param {object} args - 包含分享ID的对象
     * @param {string} args.share_id - 分享ID
     * @returns {Promise<any>} - 表示删除成功的响应对象
     */
    remove_share(args: {
        share_id: string;
    }): Promise<any>;
    /**
     * 创建分享
     * @param {object} args - 创建分享所需的参数对象
     * @param {string} [args.supplierName] - 供应商名称
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.title - 分享标题
     * @param {string} [args.password] - 分享密码（可选）
     * @param {string} [args.rag_list] - 分享权限列表（可选）
     * @param {string} [args.agent_name] - 代理名称（可选）
     * @returns {Promise<any>} - 表示创建成功的响应对象
     */
    create_share(args: {
        supplierName?: string;
        model: string;
        parameters: string;
        title: string;
        password?: string;
        rag_list?: string;
        agent_name?: string;
        mcp_servers?: string[];
    }): Promise<any>;
    /**
     * 修改分享
     * @param {object} args - 修改分享所需的参数对象
     * @param {string} args.share_id - 分享ID
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.title - 分享标题
     * @param {string} [args.password] - 分享密码（可选）
     * @param {string} [args.rag_list] - 分享权限列表（可选）
     * @param {string} [args.supplierName] - 供应商名称（可选）
     * @param {string} [args.agent_name] - 代理名称（可选）
     * @returns {Promise<any>} - 表示修改成功的响应对象，如果分享不存在则返回错误响应
     */
    modify_share(args: {
        share_id: string;
        supplierName?: string;
        model: string;
        parameters: string;
        title: string;
        password?: string;
        rag_list?: string;
        agent_name?: string;
        mcp_servers?: string[];
    }): Promise<any>;
    /**
     * 获取分享对话历史
     * @param {object} args - 包含分享ID的对象
     * @param {string} args.share_id - 分享ID
     * @returns {Promise<any>} - 包含分享聊天历史记录的成功响应对象
     */
    get_share_chat_history(args: {
        share_id: string;
    }): Promise<any>;
    /**
     * 获取分享服务状态
     * @param {object} args - 参数对象
     * @param {string} args.status - 分享服务状态 true/false
     * @returns {Promise<any>} - 包含分享服务状态的成功响应对象
     */
    set_share_service_status(args: {
        status: string;
    }): Promise<any>;
}
export default ShareController;
