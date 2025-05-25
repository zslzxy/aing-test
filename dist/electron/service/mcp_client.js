"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/client/sse.js");
const public_1 = require("../class/public");
const path_1 = __importDefault(require("path"));
const log_1 = require("ee-core/log");
const mcp_1 = require("./mcp");
const punycode_1 = __importDefault(require("punycode/"));
class MCPClient {
    // 存储所有会话
    sessions = new Map();
    // 存储所有连接
    transports = new Map();
    // 缓存工具列表
    toolListCache = null;
    supplierName = "";
    model = "";
    openai = null;
    push = null;
    callback = null;
    /**
     * 读取 MCP 配置文件
     */
    static async readMCPConfigFile() {
        const mcpConfigFile = path_1.default.resolve(public_1.pub.get_data_path(), "mcp-server.json");
        try {
            if (public_1.pub.file_exists(mcpConfigFile)) {
                return public_1.pub.read_file(mcpConfigFile);
            }
        }
        catch (error) {
            log_1.logger.error('Failed to read MCP config file:', error);
        }
        return null;
    }
    /**
     * 解析 MCP 配置文件
     * @param {string} configContent - MCP 配置文件的内容
     * @returns {ServerConfig[]} - 解析后的服务器配置数组
     */
    static parseMCPConfig(configContent) {
        try {
            const mcpConfig = JSON.parse(configContent);
            const mcpServers = [];
            if (mcpConfig && mcpConfig.mcpServers) {
                for (const server of mcpConfig.mcpServers) {
                    const serverConfig = server;
                    if (serverConfig.isActive) {
                        mcpServers.push({
                            name: serverConfig.name,
                            description: serverConfig.description,
                            type: serverConfig.type,
                            command: serverConfig.command,
                            env: serverConfig.env,
                            args: serverConfig.args,
                            baseUrl: serverConfig.baseUrl,
                            isActive: serverConfig.isActive
                        });
                    }
                }
            }
            return mcpServers;
        }
        catch (error) {
            log_1.logger.error('Failed to parse MCP config:', error);
            return [];
        }
    }
    /**
     * 获取所有开启的 MCP 服务器
     * @param {string[]} [filter] - 服务器名称的过滤数组
     * @returns {Promise<ServerConfig[]>} - 所有开启的服务器配置数组
     */
    static async getActiveServers(filter) {
        const configContent = await this.readMCPConfigFile();
        if (!configContent) {
            return [];
        }
        let mcpServices = this.parseMCPConfig(configContent);
        if (filter) {
            mcpServices = mcpServices.filter(mcpService => filter.includes(mcpService.name));
        }
        return mcpServices;
    }
    /**
     * 检查服务器配置是否有效
     * @param {ServerConfig} serverConfig - 服务器配置对象
     * @returns {ServerConfig} - 验证后的服务器配置对象
     */
    validateServerConfig(serverConfig) {
        if (serverConfig.type === undefined) {
            if (serverConfig.command) {
                serverConfig.type = 'stdio';
            }
            else if (serverConfig.baseUrl) {
                serverConfig.type = 'sse';
            }
            else {
                throw new Error("Invalid server configuration");
            }
        }
        return serverConfig;
    }
    /**
     * 创建 stdio 客户端传输实例
     * @param {string} command - 启动服务器的命令
     * @param {string[]} args - 启动服务器的参数
     * @param {Record<string, string>} env - 环境变量
     * @returns {Promise<StdioClientTransport>} - Stdio 客户端传输实例
     */
    async createStdioTransport(command, args, env) {
        if (!command) {
            throw new Error("Invalid shell command");
        }
        const serverParams = {
            command,
            args,
            env: env || {},
        };
        return new stdio_js_1.StdioClientTransport(serverParams);
    }
    /**
     * 创建 SSE 客户端传输实例
     * @param {string} url - SSE 服务器的 URL
     * @returns {Promise<SSEClientTransport>} - SSE 客户端传输实例
     */
    async createSSETransport(url) {
        try {
            return new sse_js_1.SSEClientTransport(new URL(url));
        }
        catch (error) {
            log_1.logger.error(`Failed to create SSE transport for URL ${url}:`, error);
            throw error;
        }
    }
    /**
     * 创建客户端传输实例
     * @param {ServerConfig} serverConfig - 服务器配置对象
     * @returns {Promise<StdioClientTransport | SSEClientTransport>} - 客户端传输实例
     */
    async createTransport(serverConfig) {
        if (serverConfig.type === 'stdio' && serverConfig.command) {
            let command = serverConfig.command;
            let args = serverConfig.args || [];
            let env = serverConfig.env || {};
            if (command === 'npx') {
                command = mcp_1.mcpService.get_bun_bin();
                args.unshift('x', '--bun');
                env.NPM_CONFIG_REGISTRY = "https://registry.npmmirror.com";
            }
            return this.createStdioTransport(command, args, env);
        }
        else if (serverConfig.type === 'sse' && serverConfig.baseUrl) {
            return this.createSSETransport(serverConfig.baseUrl);
        }
        else {
            throw new Error(`Invalid server configuration for: ${serverConfig.name}`);
        }
    }
    /**
     * 连接到 MCP 服务器
     * @param {ServerConfig[]} serverConfigList - 服务器配置数组
     * @returns {Promise<void>} - 连接操作的 Promise
     */
    async connectToServer(serverConfigList) {
        for (let serverConfig of serverConfigList) {
            try {
                const validatedConfig = this.validateServerConfig(serverConfig);
                const transport = await this.createTransport(validatedConfig);
                const client = new index_js_1.Client({
                    name: "mcp-client",
                    version: "1.0.0"
                }, {
                    capabilities: {
                        prompts: {},
                        resources: {},
                        tools: {}
                    }
                });
                await client.connect(transport);
                this.sessions.set(validatedConfig.name, client);
                this.transports.set(validatedConfig.name, transport);
                // 连接新服务器后，清空工具列表缓存
                this.toolListCache = null;
            }
            catch (error) {
                log_1.logger.error(`Failed to connect to server ${serverConfig.name}:`, error);
                // 此处可根据需求决定是否继续连接其他服务器
                // throw error;
            }
        }
    }
    /**
     * 获取指定服务器的工具列表
     * @param {ServerConfig} serverConfig - 服务器配置对象
     * @returns {Promise<Tool[]>} - 工具列表的 Promise
     */
    async getTools(serverConfig) {
        try {
            await this.connectToServer([serverConfig]);
            const session = this.sessions.get(serverConfig.name);
            if (!session) {
                throw new Error(`Session not found for server ${serverConfig.name}`);
            }
            const response = await session.listTools();
            return response.tools;
        }
        catch (error) {
            log_1.logger.error(`Failed to get tools for server ${serverConfig.name}:`, error);
            throw error;
        }
        finally {
            this.cleanup();
        }
    }
    /**
     * 编码 Punycode
     * @param {string} data - 要编码的字符串
     * @returns {string} - 编码后的字符串
     */
    enPunycode(data) {
        return punycode_1.default.toASCII(data);
    }
    /**
     * 解码 Punycode
     * @param {string} data - 要解码的字符串
     * @returns {string} - 解码后的字符串
     */
    dePunycode(data) {
        return punycode_1.default.toUnicode(data);
    }
    /**
     * 获取所有服务器的工具列表
     * @returns {Promise<any[]>} - 所有服务器的工具列表的 Promise
     */
    async getAllAvailableTools() {
        if (this.toolListCache) {
            return this.toolListCache;
        }
        const availableTools = [];
        try {
            for (const [serverName, session] of this.sessions) {
                const response = await session.listTools();
                const tools = response.tools.map((tool) => ({
                    type: "function",
                    function: {
                        name: `${this.enPunycode(serverName)}__${tool.name}`,
                        description: `[${serverName}] ${tool.description}`,
                        parameters: tool.inputSchema
                    }
                }));
                availableTools.push(...tools);
            }
            this.toolListCache = availableTools;
        }
        catch (error) {
            log_1.logger.error("Failed to get available tools:", error);
            throw error;
        }
        return availableTools;
    }
    /**
     * 处理工具调用结果
     * @param {MCPToolResult} toolResult - 工具调用结果对象
     * @returns {string} - 处理后的工具调用结果字符串
     */
    processToolResult(toolResult) {
        if (toolResult.content && toolResult.content.text) {
            toolResult.content = toolResult.content.text;
        }
        if (typeof toolResult.content !== 'string') {
            toolResult.content = JSON.stringify(toolResult.content);
        }
        return toolResult.content;
    }
    /**
     * 工具调用
     * @param {Record<string, OpenAI.Chat.Completions.ChatCompletionMessageToolCall>} toolCallMap - 工具调用映射
     * @param {ChatCompletionMessageParam[]} messages - 消息列表
     * @param {string} toolsContent - 工具内容
     * @returns {Promise<ChatCompletionMessageParam[]>} - 处理后的消息列表的 Promise
     */
    async callTools(toolCallMap, messages, toolsContent) {
        for (const toolCall of Object.values(toolCallMap)) {
            if (!this.isValidToolCall(toolCall)) {
                continue;
            }
            let [serverName, toolName] = toolCall.function.name.split('__');
            serverName = this.dePunycode(serverName);
            const session = this.sessions.get(serverName);
            if (!session) {
                continue;
            }
            const toolArgs = JSON.parse(toolCall.function.arguments);
            const toolResult = await this.executeToolCall(session, toolName, toolArgs);
            const toolResultContent = this.processToolResult(toolResult);
            const toolResultPush = this.createToolResultPush(serverName, toolName, toolArgs, toolResultContent);
            this.pushMessage(toolResultPush);
            // 继续与工具结果的对话
            messages = this.updateMessages(messages, toolCall, toolsContent, toolResultContent);
        }
        return messages;
    }
    /**
     * 检查工具调用是否有效
     * @param {OpenAI.Chat.Completions.ChatCompletionMessageToolCall} toolCall - 工具调用对象
     * @returns {boolean} - 工具调用是否有效的布尔值
     */
    isValidToolCall(toolCall) {
        if (toolCall.function && toolCall.function.name && toolCall.function.arguments)
            return true;
        return false;
    }
    /**
     * 执行工具调用
     * @param {Client} session - 会话对象
     * @param {string} toolName - 工具名称
     * @param {any} toolArgs - 工具参数
     * @returns {Promise<MCPToolResult>} - 工具调用结果的 Promise
     */
    async executeToolCall(session, toolName, toolArgs) {
        try {
            const result = await session.callTool({
                name: toolName,
                arguments: toolArgs
            });
            return result;
        }
        catch (error) {
            log_1.logger.error(`Failed to execute tool call for ${toolName}:`, error);
            throw error;
        }
    }
    /**
     * 创建工具调用结果推送对象
     * @param {string} serverName - 服务器名称
     * @param {string} toolName - 工具名称
     * @param {any} toolArgs - 工具参数
     * @param {string} toolResultContent - 工具调用结果内容
     * @returns {any} - 工具调用结果推送对象
     */
    createToolResultPush(serverName, toolName, toolArgs, toolResultContent) {
        return {
            "tool_server": serverName,
            "tool_name": toolName,
            "tool_args": toolArgs,
            "tool_result": JSON.parse(toolResultContent)
        };
    }
    /**
     * 推送消息
     * @param {any} message - 要推送的消息
     */
    pushMessage(message) {
        this.push("<mcptool>\n\n" + JSON.stringify(message, null, 4) + "\n\n</mcptool>\n\n");
    }
    /**
     * 更新消息列表
     * @param {ChatCompletionMessageParam[]} messages - 消息列表
     * @param {OpenAI.Chat.Completions.ChatCompletionMessageToolCall} toolCall - 工具调用对象
     * @param {string} toolsContent - 工具内容
     * @param {string} toolResultContent - 工具调用结果内容
     * @returns {ChatCompletionMessageParam[]} - 更新后的消息列表
     */
    updateMessages(messages, toolCall, toolsContent, toolResultContent) {
        messages.push({
            role: "assistant",
            content: toolsContent,
            tool_calls: [toolCall]
        });
        messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResultContent,
        });
        return messages;
    }
    /**
     * 处理 OpenAI 响应中的工具调用
     * @param {Stream<OpenAI.Chat.Completions.ChatCompletion>} completion - OpenAI 响应流
     * @param {ChatCompletionMessageParam[]} messages - 消息列表
     * @param {any[]} availableTools - 可用的工具列表
     * @returns {Promise<ChatCompletionMessageParam[]>} - 处理后的消息列表的 Promise
     */
    async handleOpenAIToolCalls(completion, messages, availableTools) {
        let toolId = "";
        let toolCallMap = {};
        let toolsContent = "";
        for await (const chunk of completion) {
            for (let choice of chunk.choices) {
                const message = choice.delta;
                // 合并工具调用
                if (message.tool_calls) {
                    if (message.content) {
                        toolsContent += message.content;
                    }
                    for (const toolCall of message.tool_calls) {
                        if (toolCall.id)
                            toolId = toolCall.id;
                        if (!toolCallMap[toolId]) {
                            toolCallMap[toolId] = {
                                id: toolId,
                                type: "function",
                                function: {
                                    name: "",
                                    arguments: ""
                                }
                            };
                        }
                        if (toolCall.type)
                            toolCallMap[toolId].type = toolCall.type;
                        if (toolCall.function) {
                            if (toolCall.function.name) {
                                toolCallMap[toolId].function.name = toolCall.function.name;
                            }
                            if (toolCall.function.arguments) {
                                toolCallMap[toolId].function.arguments += toolCall.function.arguments;
                            }
                        }
                    }
                }
                else {
                    this.callback(chunk);
                }
            }
        }
        // 处理工具调用
        if (Object.keys(toolCallMap).length > 0) {
            messages = await this.callTools(toolCallMap, messages, toolsContent);
            // 递归处理工具调用
            await this.handleToolCalls(availableTools, messages, true);
        }
        return messages;
    }
    /**
     * 处理工具调用
     * @param {any} availableTools - 可用的工具列表
     * @param {ChatCompletionMessageParam[]} messages - 消息列表
     * @param {boolean} [isRecursive=false] - 是否递归调用
     * @returns {Promise<void>} - 处理工具调用操作的 Promise
     */
    async handleToolCalls(availableTools, messages, isRecursive = false) {
        // 调用OpenAI API
        try {
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                tools: availableTools,
                tool_choice: "auto",
                stream: true
            });
            // 处理OpenAI的响应
            await this.handleOpenAIToolCalls(completion, messages, availableTools);
        }
        catch (error) {
            log_1.logger.error("Failed to call OpenAI API:", error);
            throw error;
        }
    }
    /**
     * 处理查询
     * @param {OpenAI} openai - OpenAI 实例
     * @param {string} supplierName - 供应商名称
     * @param {string} model - 模型名称
     * @param {ChatCompletionMessageParam[]} messages - 消息列表
     * @param {Function} callback - 回调函数
     * @param {Function} push - 推送函数
     * @returns {Promise<string>} - 处理结果的 Promise
     */
    async processQuery(openai, supplierName, model, messages, callback, push) {
        if (this.sessions.size === 0) {
            throw new Error("Not connected to any server");
        }
        const availableTools = await this.getAllAvailableTools();
        try {
            this.supplierName = supplierName;
            this.model = model;
            this.openai = openai;
            this.push = push;
            this.callback = callback;
            // 处理工具调用
            await this.handleToolCalls(availableTools, messages);
        }
        catch (error) {
            // push("Failed to process query:" + error.message);
            let chunk = {
                created_at: Date.now(),
                index: 0,
                choices: [
                    {
                        finish_reason: "stop",
                        delta: {
                            content: "Error: " + error.message
                        }
                    }
                ]
            };
            callback(chunk);
            log_1.logger.error("Failed to process query:", error);
            throw error;
        }
        finally {
            // 关闭所有连接
            await this.cleanup();
        }
        // 此处可根据实际需求返回处理结果
        return '';
    }
    /**
     * 关闭所有连接
     * @returns {Promise<void>} - 关闭连接操作的 Promise
     */
    async cleanup() {
        try {
            for (const transport of this.transports.values()) {
                await transport.close();
            }
            this.transports.clear();
            this.sessions.clear();
            this.toolListCache = null;
        }
        catch (error) {
            log_1.logger.error("Failed to cleanup connections:", error);
            throw error;
        }
    }
    /**
     * 判断是否有活动的会话
     * @returns {boolean} - 是否有活动会话的布尔值
     */
    hasActiveSessions() {
        return this.sessions.size > 0;
    }
}
exports.MCPClient = MCPClient;
//# sourceMappingURL=mcp_client.js.map