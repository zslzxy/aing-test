/**
 * index controller 类，用于处理主进程的语言相关逻辑
 * @class
 */
declare class IndexController {
    get_version(): Promise<any>;
    /**
     * 获取当前语言和支持的语言列表
     * @returns {Promise<Object>} 包含语言列表和当前语言的对象，封装在成功响应中返回
     */
    get_languages(): Promise<any>;
    /**
     * 设置当前语言
     * @param {Object} args - 参数对象
     * @param {string} args.language - 要设置的语言
     * @returns {Promise<Object>} 封装了设置成功信息的响应对象
     */
    set_language(args: {
        language: string;
    }): Promise<any>;
    /**
     * 获取客户端语言包
     * @returns {Promise<Object>} 包含客户端语言包内容的对象，封装在成功响应中返回
     */
    get_client_language(): Promise<any>;
    /**
     * 获取服务端语言包
     * @returns {Promise<Object>} 包含服务端语言包内容的对象，封装在成功响应中返回
     */
    get_server_language(): Promise<any>;
    /**
     * 通用的获取语言包方法
     * @param {string} type - 语言包类型，如 'client' 或 'server'
     * @returns {Promise<Object>} 包含指定类型语言包内容的对象，封装在成功响应中返回
     */
    private getLanguagePack;
    /**
     * 选择目录 - 在纯后端模式下，此功能需要前端提供目录路径
     * @param args - 参数，包含folder路径
     */
    select_folder(args: {
        folder?: string;
    }): Promise<any>;
    /**
     * 接收前端错误日志，并写入到日志文件
     * @param args
     * @returns
     */
    write_logs(args: {
        logs: string;
    }): Promise<any>;
    /**
     * 获取数据保存路径
     * @returns {Promise<any>} 返回成功响应，包含数据保存路径
     */
    get_data_save_path(): Promise<any>;
    /**
     * 设置数据保存路径
     * @param args - 参数对象
     * @returns {Promise<any>} 返回成功响应，包含设置结果
     */
    set_data_save_path(args: {
        newPath: string;
    }): Promise<any>;
}
declare const _default: IndexController;
export default _default;
