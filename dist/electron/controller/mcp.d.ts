/**
 * mcp controller 类，用于处理MCP相关逻辑
 * @class
 */
declare class McpController {
    /**
     * 获取已安装的MCP服务器列表
     * @param args
     * @returns {Promise<any>} - 返回已安装的MCP服务器列表
     */
    get_mcp_server_list(args: any): Promise<any>;
    /**
     * 获取常用的MCP服务器列表
     * @param args
     * @returns {Promise<any>} - 返回常用的MCP服务器列表
     */
    get_common_server_list(args: any): Promise<any>;
    /**
     * 获取MCP服务器信息
     * @param args
     * @returns {Promise<any>} - 返回MCP服务器信息
     */
    get_mcp_server_info(args: {
        name: string;
    }): Promise<any>;
    /**
     * 修改MCP服务器信息
     * @param args.name <string> - MCP服务器名称
     * @param args.discription <string> - 描述
     * @param args.type <string> - 类型 (stdio | sse)
     * @param args.command <string> - 执行命令 (npx | uv | 其它可执行文件全路径)
     * @param args.baseUrl <string> - 服务器URL地址
     * @param args.env <object> - 环境变量
     * @param args.args <string[]> - 参数
     * @param args.is_active <boolean> - 是否可用
     * @return {Promise<any>} - 返回操作结果
     */
    modify_mcp_server(args: {
        name: string;
        description: string;
        type: "stdio" | "sse";
        command: string;
        baseUrl: string;
        env: Record<string, string>;
        args: string[];
        is_active: boolean;
    }): Promise<import("../class/public").ReturnMsg>;
    /**
     * 卸载MCP服务器
     * @param args.name <string> - MCP服务器名称
     * @return {Promise<any>} - 返回操作结果
     */
    remove_mcp_server(args: {
        name: string;
    }): Promise<import("../class/public").ReturnMsg>;
    /**
     * 添加MCP服务器
     * @param args.name <string> - MCP服务器名称
     * @param args.description <string> - 描述
     * @param args.type <string> - 类型 (stdio | sse)
     * @param args.command <string> - 执行命令 (npx | uv | 其它可执行文件全路径)
     * @param args.baseUrl <string> - 服务器URL地址
     * @param args.env <object> - 环境变量
     * @param args.args <string[]> - 参数
     * @return {Promise<any>} - 返回操作结果
     */
    add_mcp_server(args: {
        name: string;
        description: string;
        type: "stdio" | "sse";
        command: string;
        baseUrl: string;
        env: Record<string, string>;
        args: string[];
    }): Promise<import("../class/public").ReturnMsg>;
    /**
     * 修改MCP服务器工具信息
     * @param args.name <string> - MCP服务器名称
     * @param args.tools <Record<string,boolean>> - 工具可用性
     * @return {Promise<any>} - 返回操作结果
     */
    modify_mcp_tools(args: {
        name: string;
        tools: Record<string, boolean>;
    }): Promise<import("../class/public").ReturnMsg>;
    /**
     * 获取MCP服务器工具信息
     * @param args.name <string> - MCP服务器名称
     */
    get_mcp_tools(args: {
        name: string;
    }): Promise<import("../class/public").ReturnMsg>;
    /**
     * 检查环境状态
     * @param args - 参数对象
     */
    get_status(args: any): Promise<import("../class/public").ReturnMsg>;
    /**
     * 安装 node.js环境
     * @param args - 参数对象
     */
    install_npx(args: any): Promise<import("../class/public").ReturnMsg>;
    /**
     * 安装 python环境
     * @param args - 参数对象
     */
    install_uv(args: any): Promise<unknown>;
    /**
     * 获取MCP配置文件内容
     * @param args - 参数对象
     * @returns {Promise<any>} - 返回MCP配置文件内容
     */
    get_mcp_config_body(args: any): Promise<import("../class/public").ReturnMsg>;
    /**
     * 保存MCP配置文件内容
     * @param args - 参数对象
     * @returns {Promise<any>} - 返回操作结果
     */
    save_mcp_config_body(args: {
        mcp_config_body: string;
    }): Promise<import("../class/public").ReturnMsg>;
    /**
     * 获取pypi和npm的源列表
     * @param args - 参数对象
     * @returns
     */
    get_registry_list(args: any): Promise<import("../class/public").ReturnMsg>;
    /**
     * 同步云端的MCP配置文件
     * @param args - 参数对象
     * @returns {Promise<any>} - 返回操作结果
     */
    sync_cloud_mcp(args: any): Promise<import("../class/public").ReturnMsg>;
}
declare const _default: McpController;
export default _default;
