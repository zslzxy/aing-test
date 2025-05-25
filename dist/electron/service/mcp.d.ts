import { ServerConfig, McpConfig } from './mcp_client';
declare class McpService {
    /**
     * 获取MCP配置文件
     * @returns {McpConfig|null} - 返回MCP配置对象，如果文件不存在或解析失败则返回null
     */
    read_mcp_config(): McpConfig | null;
    /**
     * 获取MCP服务器列表
     * @returns {ServerConfig[]} - 返回MCP服务器列表
     */
    get_mcp_servers(): ServerConfig[];
    /**
     * 保存MCP配置文件
     * @param {McpConfig} mcpConfig - MCP配置对象
     */
    save_mcp_config(mcpServers: ServerConfig[]): void;
    /**
     * 获取常用的MCP服务器列表
     * @returns {Promise<any>} - 返回常用的MCP服务器列表
     */
    read_common_mcp_config(): any;
    /**
     * 保存常用的MCP配置文件
     * @param {any} config - 常用MCP配置对象
     */
    save_common_mcp_config(config: any): void;
    get_bin_path(): string;
    get_bun_bin(): string;
    get_uv_bin(): string;
    /**
     * 获取当前操作系统的路径
     * @returns {string} - 返回当前操作系统的路径
     */
    get_os_path(): string;
    download_file(url: string, saveFile: string): Promise<unknown>;
    /**
     * 安装 node.js环境
     * @param args - 参数对象
     */
    install_npx(): Promise<import("../class/public").ReturnMsg>;
    /**
     * 清除node.js环境变量
     * @returns {void}
     */
    clear_node_env(): void;
    /**
     * 保存 MCP 工具列表
     * @param name {string} - 工具名称
     * @param tools {any} - 工具列表
     * @returns
     */
    save_mcp_tools(name: string, tools: any): void;
    /**
     * 读取 MCP 工具列表
     * @param name {string} - 工具名称
     * @returns
     */
    read_mcp_tools(name: string): any;
    /**
     * 同步云端的 MCP 服务器配置
     * @returns {Promise<any>} - 返回同步结果
     */
    sync_cloud_mcp(): Promise<import("../class/public").ReturnMsg>;
}
/**
 * 导出 McpService 类的单例实例
 */
export declare const mcpService: McpService;
export {};
