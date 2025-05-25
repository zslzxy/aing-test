/**
 * manager controller 类，负责管理模型和系统配置信息
 * @class
 */
declare class ManagerController {
    /**
     * 获取模型管理器信息
     * @returns {Promise<any>} - 包含模型管理器信息的成功响应
     */
    get_model_manager(): Promise<any>;
    /**
     * 安装模型
     * @param {Object} args - 安装模型所需的参数
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @returns {Promise<any>} - 包含安装结果的成功响应
     */
    install_model(args: {
        model: string;
        parameters: string;
    }): Promise<any>;
    /**
     * 获取模型安装进度
     * @param {Object} args - 获取安装进度所需的参数
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @returns {Promise<any>} - 包含安装进度信息的成功响应
     */
    get_model_install_progress(args: {
        model: string;
        parameters: string;
    }): Promise<any>;
    /**
     * 删除模型
     * @param {Object} args - 删除模型所需的参数
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @returns {Promise<any>} - 包含删除结果的成功响应
     */
    remove_model(args: any): Promise<any>;
    /**
     * 安装模型管理器
     * @param {Object} args - 安装模型管理器所需的参数
     * @param {string} args.manager_name - 模型管理器名称
     * @returns {Promise<any>} - 包含安装状态的响应
     */
    install_model_manager(args: {
        manager_name: string;
        models_path?: string;
    }): Promise<any>;
    /**
     * 获取模型管理器安装进度
     * @param {Object} args - 获取安装进度所需的参数
     * @param {string} args.manager_name - 模型管理器名称
     * @returns {Promise<any>} - 包含安装进度信息的成功响应
     */
    get_model_manager_install_progress(args: {
        manager_name: string;
    }): Promise<any>;
    /**
     * 获取电脑配置信息
     * @returns {Promise<any>} - 包含电脑配置信息的成功响应
     */
    get_configuration_info(): Promise<any>;
    /**
     * 检查 nvidia-smi 命令是否存在
     * @param {string} osType - 操作系统类型
     * @returns {boolean} - 如果 nvidia-smi 命令存在返回 true，否则返回 false
     */
    checkNvidiaSmiExists(osType: string): boolean;
    /**
     * 获取磁盘信息
     * @returns {Promise<object[]>} - 包含磁盘信息的数组
     */
    get_disk_list(): Promise<object[]>;
    /**
     * 修改 Ollama 模型保存路径
     * @param {Object} args - 修改保存路径所需的参数
     * @param {string} args.save_path - 新的模型保存路径
     * @returns {Promise<any>} - 包含修改结果的成功响应
     */
    set_ollama_model_save_path(args: {
        save_path: string;
    }): Promise<any>;
    /**
     * 断开重连模型下载任务
     */
    reconnect_model_download(): Promise<import("../class/public").ReturnMsg>;
    /**
     * 设置ollama连接地址
     * @param {Object} args - 设置ollama连接地址所需的参数
     * @param {string} args.ollama_host - ollama连接地址
     * @returns {Promise<any>} - 包含修改结果的成功响应
     */
    set_ollama_host(args: {
        ollama_host: string;
    }): Promise<any>;
}
export default ManagerController;
