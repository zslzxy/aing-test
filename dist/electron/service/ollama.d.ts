/**
 * OllamaService 类，提供与 Ollama 相关的操作，如获取版本、管理模型、安装 Ollama 等
 */
declare class OllamaService {
    /**
     * 获取 Ollama 可执行文件的路径
     * @returns {string[]} 包含 Ollama 可执行文件路径的数组
     */
    get_ollama_bin(): string[];
    /**
     * 获取 Ollama 的版本信息
     * @returns {string} 若成功获取到版本信息则返回版本号，否则返回空字符串
     */
    version(): Promise<string>;
    /**
     * 检查 Ollama 是否正在运行
     * @returns {Promise<boolean>} 若 Ollama 正在运行则返回 true，否则返回 false
     */
    is_running(): Promise<boolean>;
    /**
     * 启动 Ollama 服务
     * @returns {Promise<boolean>} 若 Ollama 启动成功则返回 true，否则返回 false
     */
    start(): Promise<boolean>;
    /**
     * 获取嵌套模型列表
     * @returns {Promise<any[]>} 包含模型信息的数组，若出错则返回空数组
     */
    get_embedding_model_list(): Promise<any[]>;
    /**
     * 获取 Ollama 模型列表
     * @returns {Promise<any[]>} 包含模型信息的数组，若出错则返回空数组
     */
    model_list(): Promise<any[]>;
    /**
     * 下载速度监控
     * @param fullModel <string> 模型全名，如：deepseek-r1:1.5b
     * @returns
     */
    download_speed_monitoring(fullModel: string): void;
    /**
     * 添加下载速度到列表
     * @param speed <number> 下载速度
     */
    append_speed_to_list(speed: number): void;
    /**
     * 获取平均下载速度
     * @returns
     */
    get_average_speed(): {
        average: number;
        average10s: number;
    };
    /**
     * 安装指定模型
     * @param {string} model 模型名称，如：deepseek-r1
     * @param {string} parameters 模型参数规模，如：1.5b
     * @returns {Promise<boolean>} 安装成功返回 true，否则返回 false
     */
    install_model(model: string, parameters: string): Promise<boolean>;
    /**
     * 重连模型下载
     */
    reconnect_model_download(): void;
    /**
     * 重连 Ollama 下载
     */
    reconnect_ollama_download(): void;
    /**
     * 获取模型安装进度
     * @param {string} model 模型名称，如：deepseek-r1
     * @param {string} parameters 模型参数规模，如：1.5b
     * @returns {Object} 包含模型下载进度和速度等信息的对象
     */
    get_model_install_progress(model: string, parameters: string): Object;
    /**
     * 删除指定模型
     * @param {string} model 模型名称，如：deepseek-r1
     * @param {string} parameters 模型参数规模，如：1.5b
     * @returns {Promise<any>} 删除操作的结果
     */
    remove_model(model: string, parameters: string): Promise<any>;
    ollama_download_end(downloadFile: string): Promise<void>;
    /**
     * 安装 Ollama
     * @returns {Promise<boolean>} 安装成功返回 true，否则返回 false
     */
    install_ollama(): Promise<boolean>;
    /**
     * 获取 Ollama 安装进度
     * @returns {Object} 包含 Ollama 下载进度和速度等信息的对象
     */
    get_ollama_install_progress(): Object;
    /**
     * 设置 Ollama 模型存储目录
     * @param {string} save_path 模型存储目录的路径
     * @returns {boolean} 设置成功返回 true，否则返回 false
     */
    set_ollama_model_save_path(save_path: string): boolean;
    /**
     * 根据操作系统获取 Ollama 的下载信息
     * @returns {downloadUrl: string, downloadFile: string } 包含下载 URL 和文件路径的对象
     */
    private getOllamaDownloadInfo;
    /**
     * 下载完成后安装 Ollama
     * @param {string} downloadFile 下载的文件路径
     * @returns {Promise<boolean>} 安装成功返回 true，否则返回 false
     */
    private installOllamaAfterDownload;
    /**
     * 结束 Ollama 进程
     * @param {string} shell 要使用的 shell 类型
     */
    private killOllamaProcess;
    private test_ollama_host;
    /**
     * 设置ollama地址和密钥
     * @param {string} ollamaHost - ollama地址
     * @returns {Promise<boolean>} 设置成功返回 true，否则返回 false
     */
    set_ollama_host(ollamaHost: string): Promise<boolean>;
}
declare const ollamaService: OllamaService;
export { OllamaService, ollamaService, };
