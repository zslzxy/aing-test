"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const public_1 = require("../class/public");
const path = __importStar(require("path"));
const log_1 = require("ee-core/log");
const mcp_client_1 = require("../service/mcp_client");
const mcp_1 = require("../service/mcp");
/**
 * mcp controller 类，用于处理MCP相关逻辑
 * @class
 */
class McpController {
    /**
     * 获取已安装的MCP服务器列表
     * @param args
     * @returns {Promise<any>} - 返回已安装的MCP服务器列表
     */
    async get_mcp_server_list(args) {
        let mcpServers = mcp_1.mcpService.get_mcp_servers();
        // 获取服务器工具列表
        for (let server of mcpServers) {
            server.tools = mcp_1.mcpService.read_mcp_tools(server.name);
        }
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), mcpServers);
    }
    /**
     * 获取常用的MCP服务器列表
     * @param args
     * @returns {Promise<any>} - 返回常用的MCP服务器列表
     */
    async get_common_server_list(args) {
        let commonMcpConfig = mcp_1.mcpService.read_common_mcp_config();
        let mcpServers = [];
        if (commonMcpConfig && commonMcpConfig) {
            mcpServers = commonMcpConfig;
            // 判断是否已安装
            let lastMcpServers = mcp_1.mcpService.get_mcp_servers();
            for (let i = 0; i < mcpServers.length; i++) {
                let server = mcpServers[i];
                if (lastMcpServers && lastMcpServers.length > 0) {
                    let installedServer = lastMcpServers.find((s) => s.name === server.name);
                    if (installedServer) {
                        server.is_install = true;
                    }
                    else {
                        server.is_install = false;
                    }
                }
                else {
                    server.is_install = false;
                }
            }
        }
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), mcpServers);
    }
    /**
     * 获取MCP服务器信息
     * @param args
     * @returns {Promise<any>} - 返回MCP服务器信息
     */
    async get_mcp_server_info(args) {
        let mcpServers = mcp_1.mcpService.get_mcp_servers();
        let server = mcpServers.find((s) => s.name === args.name);
        if (!server) {
            return public_1.pub.return_error(public_1.pub.lang('未找到该服务器'));
        }
        // 获取服务器工具列表
        // todo: 需要根据服务器类型获取对应的工具列表
        let tools = [];
        server.tools = tools;
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), server);
    }
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
    async modify_mcp_server(args) {
        let mcpConfig = mcp_1.mcpService.read_mcp_config();
        let mcpServers = [];
        if (mcpConfig && mcpConfig.mcpServers) {
            mcpServers = mcpConfig.mcpServers;
        }
        let server = mcpServers.find((s) => s.name === args.name);
        if (!server) {
            return public_1.pub.return_error(public_1.pub.lang('未找到该服务器'));
        }
        server.description = args.description;
        server.type = args.type;
        server.command = args.command;
        server.baseUrl = args.baseUrl;
        server.env = args.env;
        server.args = args.args;
        server.isActive = args.is_active;
        // 保存配置文件
        mcp_1.mcpService.save_mcp_config(mcpServers);
        return public_1.pub.return_success(public_1.pub.lang('修改成功'));
    }
    /**
     * 卸载MCP服务器
     * @param args.name <string> - MCP服务器名称
     * @return {Promise<any>} - 返回操作结果
     */
    async remove_mcp_server(args) {
        let mcpConfig = mcp_1.mcpService.read_mcp_config();
        let mcpServers = [];
        if (mcpConfig && mcpConfig.mcpServers) {
            mcpServers = mcpConfig.mcpServers;
        }
        let serverIndex = mcpServers.findIndex((s) => s.name === args.name);
        if (serverIndex === -1) {
            return public_1.pub.return_error(public_1.pub.lang('未找到该服务器'));
        }
        // 删除服务器
        mcpServers.splice(serverIndex, 1);
        // 保存配置文件
        mcp_1.mcpService.save_mcp_config(mcpServers);
        return public_1.pub.return_success(public_1.pub.lang('卸载成功'));
    }
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
    async add_mcp_server(args) {
        let mcpConfig = mcp_1.mcpService.read_mcp_config();
        let mcpServers = [];
        if (mcpConfig && mcpConfig.mcpServers) {
            mcpServers = mcpConfig.mcpServers;
        }
        // 判断是否已存在
        let server = mcpServers.find((s) => s.name === args.name);
        if (server) {
            return public_1.pub.return_error(public_1.pub.lang('该服务器已存在'));
        }
        if (typeof args.env === 'string') {
            try {
                args.env = JSON.parse(args.env);
            }
            catch (e) {
                return public_1.pub.return_error(public_1.pub.lang('环境变量格式错误'));
            }
        }
        if (typeof args.args === 'string') {
            try {
                args.args = JSON.parse(args.args);
            }
            catch (e) {
                return public_1.pub.return_error(public_1.pub.lang('参数格式错误'));
            }
        }
        // 添加服务器
        server = {
            name: args.name,
            description: args.description,
            type: args.type,
            command: args.command,
            baseUrl: args.baseUrl,
            env: args.env,
            args: args.args,
            isActive: true
        };
        mcpServers.push(server);
        // 保存配置文件
        mcp_1.mcpService.save_mcp_config(mcpServers);
        return public_1.pub.return_success(public_1.pub.lang('添加成功'));
    }
    /**
     * 修改MCP服务器工具信息
     * @param args.name <string> - MCP服务器名称
     * @param args.tools <Record<string,boolean>> - 工具可用性
     * @return {Promise<any>} - 返回操作结果
     */
    async modify_mcp_tools(args) {
        let mcpConfig = mcp_1.mcpService.read_mcp_config();
        let mcpServers = [];
        if (mcpConfig && mcpConfig.mcpServers) {
            mcpServers = mcpConfig.mcpServers;
        }
        let server = mcpServers.find((s) => s.name === args.name);
        if (!server) {
            return public_1.pub.return_error(public_1.pub.lang('未找到该服务器'));
        }
        // 修改工具可用性
        for (let i = 0; i < server.tools.length; i++) {
            let tool = server.tools[i];
            if (args.tools[tool.name] !== undefined) {
                tool.is_active = args.tools[tool.name];
            }
        }
        // 保存配置文件
        mcp_1.mcpService.save_mcp_config(mcpServers);
        return public_1.pub.return_success(public_1.pub.lang('修改成功'));
    }
    /**
     * 获取MCP服务器工具信息
     * @param args.name <string> - MCP服务器名称
     */
    async get_mcp_tools(args) {
        let mcpConfig = mcp_1.mcpService.read_mcp_config();
        let mcpServers = [];
        if (mcpConfig && mcpConfig.mcpServers) {
            mcpServers = mcpConfig.mcpServers;
        }
        let server = mcpServers.find((s) => s.name === args.name);
        if (!server) {
            return public_1.pub.return_error(public_1.pub.lang('未找到该服务器'));
        }
        let mcpClient = new mcp_client_1.MCPClient();
        let tools = await mcpClient.getTools(server);
        // 保存工具信息
        if (tools) {
            mcp_1.mcpService.save_mcp_tools(server.name, tools);
        }
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), tools);
    }
    /**
     * 检查环境状态
     * @param args - 参数对象
     */
    async get_status(args) {
        let bunFile = mcp_1.mcpService.get_bun_bin();
        let isBun = 1;
        if (!public_1.pub.file_exists(bunFile)) {
            isBun = 0;
        }
        if (isBun === 0) {
            if (global.bunInstall) {
                isBun = 2;
            }
        }
        let uvFile = mcp_1.mcpService.get_uv_bin();
        let isUv = 1;
        if (!public_1.pub.file_exists(uvFile)) {
            isUv = 0;
        }
        if (isUv === 0) {
            if (global.uvInstall) {
                isUv = 2;
            }
        }
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), {
            node_npx: isBun,
            python_uv: isUv,
        });
    }
    /**
     * 安装 node.js环境
     * @param args - 参数对象
     */
    async install_npx(args) {
        return mcp_1.mcpService.install_npx();
    }
    /**
     * 安装 python环境
     * @param args - 参数对象
     */
    async install_uv(args) {
        let uvFile = mcp_1.mcpService.get_uv_bin();
        if (public_1.pub.file_exists(uvFile)) {
            return public_1.pub.return_success(public_1.pub.lang('已安装'));
        }
        global.uvInstall = true;
        let binPath = mcp_1.mcpService.get_bin_path();
        let os_path = mcp_1.mcpService.get_os_path();
        let downloadUrl = `https://aingdesk.bt.cn/bin/${os_path}/uv.zip`;
        let uvzipFile = path.resolve(binPath, 'uv.zip');
        await mcp_1.mcpService.download_file(downloadUrl, uvzipFile);
        // 解压缩
        let unzip = require('unzipper');
        let fs = require('fs');
        let unzipStream = fs.createReadStream(uvzipFile).pipe(unzip.Extract({ path: binPath }));
        return new Promise((resolve, reject) => {
            unzipStream.on('close', () => {
                // 删除压缩包
                public_1.pub.delete_file(uvzipFile);
                resolve(public_1.pub.return_success(public_1.pub.lang('安装成功')));
            });
            unzipStream.on('error', (error) => {
                reject(public_1.pub.return_error(public_1.pub.lang('安装失败'), error));
            });
        });
    }
    /**
     * 获取MCP配置文件内容
     * @param args - 参数对象
     * @returns {Promise<any>} - 返回MCP配置文件内容
     */
    async get_mcp_config_body(args) {
        let mcpConfig = mcp_1.mcpService.read_mcp_config();
        if (mcpConfig && mcpConfig.mcpServers) {
            return public_1.pub.return_success(public_1.pub.lang('获取成功'), {
                mcp_config_body: JSON.stringify(mcpConfig, null, 4),
            });
        }
        else {
            return public_1.pub.return_error(public_1.pub.lang('未找到MCP配置'));
        }
    }
    /**
     * 保存MCP配置文件内容
     * @param args - 参数对象
     * @returns {Promise<any>} - 返回操作结果
     */
    async save_mcp_config_body(args) {
        let mcpConfig = mcp_1.mcpService.read_mcp_config();
        if (mcpConfig && mcpConfig.mcpServers) {
            try {
                let newMcpConfig = JSON.parse(args.mcp_config_body);
                if (!newMcpConfig.mcpServers) {
                    return public_1.pub.return_error(public_1.pub.lang('配置文件格式错误'));
                }
                let mcpServers = newMcpConfig.mcpServers;
                mcp_1.mcpService.save_mcp_config(mcpServers);
                return public_1.pub.return_success(public_1.pub.lang('保存成功'));
            }
            catch (e) {
                log_1.logger.error(`保存 MCP 配置文件时出错:${e}`);
                return public_1.pub.return_error(public_1.pub.lang('配置文件格式错误'));
            }
        }
        else {
            return public_1.pub.return_error(public_1.pub.lang('未找到MCP配置'));
        }
    }
    /**
     * 获取pypi和npm的源列表
     * @param args - 参数对象
     * @returns
     */
    async get_registry_list(args) {
        let registryListFile = path.resolve(public_1.pub.get_resource_path(), 'index_list.json');
        let defaultList = {
            "pypi": [
                {
                    "name": "pypi",
                    "url": "https://pypi.python.org/simple",
                    "description": "Python官方源"
                },
                {
                    "name": "清华大学源",
                    "url": "https://pypi.tuna.tsinghua.edu.cn/simple",
                    "description": "清华大学源，适合中国用户"
                }
            ],
            "npm": [
                {
                    "name": "npm",
                    "url": "https://registry.npmjs.org",
                    "description": "npm官方源"
                },
                {
                    "name": "淘宝源",
                    "url": "https://registry.npmmirror.com",
                    "description": "淘宝源，适合中国用户"
                }
            ]
        };
        if (public_1.pub.file_exists(registryListFile)) {
            defaultList = public_1.pub.read_json(registryListFile);
        }
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), defaultList);
    }
    /**
     * 同步云端的MCP配置文件
     * @param args - 参数对象
     * @returns {Promise<any>} - 返回操作结果
     */
    async sync_cloud_mcp(args) {
        return await mcp_1.mcpService.sync_cloud_mcp();
    }
}
/**
 * 重写 McpController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
McpController.toString = () => '[class McpController]';
// 导出 McpController 类的实例
exports.default = new McpController();
//# sourceMappingURL=mcp.js.map