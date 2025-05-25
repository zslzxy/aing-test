import * as fs from 'fs';
import { Ollama } from 'ollama';
import { Jieba, TfIdf } from '@node-rs/jieba';
export declare const jieba: Jieba;
export declare const tfidf: TfIdf;
export type ReturnMsg = {
    status: number;
    code: number;
    msg: string;
    error_msg: string;
    message: any;
};
declare class Public {
    md5(str: string): string;
    sha1(str: string): string;
    sha256(str: string): string;
    sha512(str: string): string;
    file_exists(file: string): boolean;
    read_file(file: string): string;
    read_json(file: string): any;
    write_json(file: string, data: any): void;
    write_file(file: string, content: string): void;
    delete_file(file: string): void;
    mkdir(dir: string): void;
    rmdir(dir: string): void;
    readdir(dir: string): string[];
    stat(file: string): fs.Stats;
    filesize(file: string): number;
    filectime(file: string): number;
    filemtime(file: string): number;
    uuid(): string;
    /**
     * @name 获取语言包目录
     * @returns {string} 语言包目录
     */
    get_language_path(): string;
    /**
     * @name 判断是否为文件
     * @param {string} path 文件路径
     * @returns {bool} 是否为文件
     * @example is_file('/www/wwwroot/index.html')
     */
    is_file(path: any): boolean;
    /**
     * 发送异步HTTP请求
     * @param {string} url - 请求的URL
     * @param {Object} options - 请求选项
     * @param {string} [options.method='GET'] - 请求方法 ('GET', 'POST', 'PUT', 'DELETE' 等)
     * @param {Object} [options.headers={}] - 请求头
     * @param {Object|string} [options.data] - 发送的数据
     * @param {number} [options.timeout=10000] - 超时时间(毫秒)
     * @param {string} [options.encoding='utf8'] - 响应编码
     * @param {boolean} [options.json=true] - 是否自动解析JSON响应
     * @returns {Promise<Object>} 响应对象，包含statusCode, body, headers
     */
    httpRequest(url: string, options?: {
        method?: string;
        headers?: any;
        data?: any;
        timeout?: number;
        encoding?: string;
        json?: boolean;
    }): Promise<{
        statusCode: number;
        body: any;
        headers: any;
        error?: boolean;
    }>;
    /**
     * @name 获取根目录
     * @returns {string} 根目录
     * @example get_root_path()
     */
    get_root_path(): string;
    get_user_data_path(): string;
    /**
     * @name 获取数据目录
     * @returns {string} 数据目录
     */
    get_data_path(): string;
    /**
     * 获取资源目录
     */
    get_resource_path(): string;
    /**
     * 获取系统数据目录
     * @returns
     */
    get_system_data_path(): string;
    /**
     * @name 获取上下文存储目录
     * @returns {string} 上下文存储目录
     */
    get_context_path(uuid: string): string;
    /**
     * @name 获取上下文存储目录
     * @returns {string} 上下文存储目录
     */
    get_share_context_path(shareId: string, contextId: string): string;
    /**
     * @name 获取配置项
     * @param {string} key 配置项
     * @returns {any}
     */
    config_get(key: string): any;
    /**
     * @name 设置配置项
     * @param {string} key
     * @param {any} value
     */
    config_set(key: string, value: any): any;
    /**
     * @name 读取或设置配置项
     * @param {string} key 配置项 [必填]
     * @param {string} value 配置值 [选填] 如果没有值则为读取配置项
     * @returns {any}
     * @example C('test','123')
     */
    C(key: string, value?: any): any;
    /**
     * @name 获取当前语言
     * @returns {string}
     * @example get_language()
     */
    get_language(): any;
    /**
     * @name 获取当前语言和支持的语言列表
     * @returns {Object} 返回结果
     */
    get_languages(): any;
    /**
     * @name 获取客户端语言包
     * @returns {Object} 返回结果
     */
    get_client_language(): any;
    /**
     * @name 多语言渲染
     * @param {string} content - 内容
     * @param {any[]} args - 参数
     * @returns {string}
     * @example lang('Hello {}', 'World')
     * @example lang('Hello {} {}', 'World', '!')
     * @example lang('Hello')
     */
    lang(content: any, ...args: any[]): any;
    /**
     * @name 获取缓存
     * @param {any} key 缓存键
     * @returns
     */
    cache_get(key: any): any;
    /**
     * @name 设置缓存
     * @param {any} key 缓存键
     * @param {any} value 缓存值
     * @param {number} expire 过期时间
     * @returns
     */
    cache_set(key: any, value: any, expire: number): boolean;
    /**
     * @name 删除缓存
     * @param {any} key 缓存键
     * @returns
     */
    cache_del(key: any): number;
    /**
     * @name 清空缓存
     * @returns
     */
    cache_clear(): void;
    /**
     * @name 判断缓存是否存在
     * @param {any} key 缓存键
     * @returns
     * @example cache_has('key')
     */
    cache_has(key: any): boolean;
    /**
     * 通用返回消息
     * @param {number} status 状态 0成功 -1失败
     * @param {number} code 状态码
     * @param {string} msg 消息
     * @param {string} error_msg 错误消息
     * @param {any} message 响应数据
     * @returns {ReturnMsg}
     */
    return_msg(status: number, code: number, msg: string, error_msg: string, message: any): ReturnMsg;
    /**
     * 返回成功消息
     * @param {string} msg 消息
     * @param {any} message 响应数据
     * @returns {ReturnMsg}
     */
    return_success(msg: string, message?: any): ReturnMsg;
    /**
     * 返回失败消息
     * @param {string} msg 消息
     * @param {string} error_msg 响应数据
     * @returns {ReturnMsg}
     */
    return_error(msg: string, error_msg?: any): ReturnMsg;
    /**
     * 简化响应消息
     * @param {bool} status 消息
     * @param {string} msg 提示消息
     * @param {any} message 响应数据
     * @returns {ReturnMsg}
     */
    return_simple(status: boolean, msg: string, message: any): ReturnMsg;
    /**
     * @name 执行cmd/shell命令
     * @param {string} cmd 命令
     * @returns {string} 返回结果
     */
    exec_shell(cmd: string): string;
    /**
     * @name 获取当前时间
     * @returns {number} 返回当前时间戳(秒级)
     */
    time(): number;
    is_windows(): boolean;
    is_linux(): boolean;
    is_mac(): boolean;
    update_env(): void;
    private getWindowsEnv;
    private getNonWindowsEnv;
    private parseEnvLine;
    private updateProcessEnv;
    /**
     * @name 延迟执行
     * @param {number} ms 延迟时间
     * @returns {Promise<void>}
     */
    sleep(ms: number): Promise<void>;
    /**
     * @name 获取MAC地址
     * @returns string
     */
    get_mac_address(): string;
    /**
     * @name 获取设备唯一标识
     * @returns string
     */
    get_device_id(): string;
    /**
     * @name 获取软件版本
     * @returns string
     */
    version(): string;
    /**
     * @name 获取系统类型
     * @returns string  Windows | Linux | MacOS
     */
    os_type(): string;
    /**
     * @name 获取客户端ID
     * @returns string
     */
    client_id(): string;
    /**
     * Convert bytes to a more readable format
     */
    bytesChange(limit: number): string;
    /**
     * 将图片转为base64
     * @param file 文件路径
     * @returns string
     */
    imageToBase64(file: string): string;
    getCurrentDateTime: () => string;
    getCurrentDate: () => string;
    getUserLocation: () => any;
    openFile(filePath: any): void;
    randomString(length?: number): string;
    /**
     * 获取ollama地址和密钥
     * @returns {Promise<{apiUrl:string,apiKey:string}>} 返回ollama地址和密钥
     */
    get_ollama_host(): string;
    /**
     * 初始化ollama
     * @param {boolean} force 是否强制重新初始化
     * @returns Ollama
     */
    init_ollama(): Ollama;
    /**
     * @name 分词（搜索）
     * @param doc 文档内容
     * @returns string[] 分词结果
     */
    cutForSearch(doc: string): string[];
    /**
     * 计算目录下的所有文件的大小
     * @param dirPath - 目录路径
     * @returns number
     */
    getDirSize(dirPath: string): number;
    /**
     * @name 获取向量数据库路径
     * @returns {string} 向量数据库路径
     */
    get_db_path(): string;
    /**
     * @name 获取知识库路径
     * @returns {string} 知识库路径
     */
    get_rag_path(): string;
}
declare const pub: Public;
export { pub, Public };
