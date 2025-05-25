"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpService = void 0;
const path_1 = __importDefault(require("path"));
const public_1 = require("../class/public");
const log_1 = require("ee-core/log");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
class McpService {
    /**
     * 获取MCP配置文件
     * @returns {McpConfig|null} - 返回MCP配置对象，如果文件不存在或解析失败则返回null
     */
    read_mcp_config() {
        const mcp_config_file = path_1.default.resolve(public_1.pub.get_data_path(), 'mcp-server.json');
        if (!public_1.pub.file_exists(mcp_config_file)) {
            let defaultConfig = {
                mcpServers: []
            };
            public_1.pub.write_json(mcp_config_file, defaultConfig);
            log_1.logger.info(`MCP配置文件 ${mcp_config_file} 不存在，已创建默认配置文件`);
        }
        try {
            return public_1.pub.read_json(mcp_config_file);
        }
        catch (error) {
            log_1.logger.error(`读取 MCP 配置文件 ${mcp_config_file} 时出错:`, error);
            return null;
        }
    }
    /**
     * 获取MCP服务器列表
     * @returns {ServerConfig[]} - 返回MCP服务器列表
     */
    get_mcp_servers() {
        let mcpConfig = this.read_mcp_config();
        if (mcpConfig && mcpConfig.mcpServers) {
            return mcpConfig.mcpServers;
        }
        return [];
    }
    /**
     * 保存MCP配置文件
     * @param {McpConfig} mcpConfig - MCP配置对象
     */
    save_mcp_config(mcpServers) {
        const mcp_config_file = path_1.default.resolve(public_1.pub.get_data_path(), 'mcp-server.json');
        try {
            let mcpConfig = this.read_mcp_config();
            if (!mcpConfig) {
                mcpConfig = { mcpServers: [] };
            }
            mcpConfig.mcpServers = mcpServers;
            public_1.pub.write_json(mcp_config_file, mcpConfig);
        }
        catch (error) {
            log_1.logger.error(`保存 MCP 配置文件 ${mcp_config_file} 时出错:`, error);
        }
    }
    /**
     * 获取常用的MCP服务器列表
     * @returns {Promise<any>} - 返回常用的MCP服务器列表
     */
    read_common_mcp_config() {
        const common_mcp_config_file = path_1.default.resolve(public_1.pub.get_data_path(), 'common-mcp-server.json');
        if (!public_1.pub.file_exists(common_mcp_config_file)) {
            return null;
        }
        try {
            return public_1.pub.read_json(common_mcp_config_file);
        }
        catch (error) {
            log_1.logger.error(`读取常用 MCP 配置文件 ${common_mcp_config_file} 时出错:`, error);
            return null;
        }
    }
    /**
     * 保存常用的MCP配置文件
     * @param {any} config - 常用MCP配置对象
     */
    save_common_mcp_config(config) {
        const common_mcp_config_file = path_1.default.resolve(public_1.pub.get_data_path(), 'common-mcp-server.json');
        try {
            public_1.pub.write_json(common_mcp_config_file, config);
        }
        catch (error) {
            log_1.logger.error(`保存常用 MCP 配置文件 ${common_mcp_config_file} 时出错:`, error);
        }
    }
    get_bin_path() {
        let binPath = path_1.default.resolve(public_1.pub.get_user_data_path(), 'bin');
        if (!public_1.pub.file_exists(binPath)) {
            public_1.pub.mkdir(binPath);
        }
        return binPath;
    }
    get_bun_bin() {
        let binPath = this.get_bin_path();
        if (public_1.pub.is_windows()) {
            return path_1.default.resolve(binPath, 'bun.exe');
        }
        return path_1.default.resolve(binPath, 'bun');
    }
    get_uv_bin() {
        let binPath = this.get_bin_path();
        if (public_1.pub.is_windows()) {
            return path_1.default.resolve(binPath, 'uv.exe');
        }
        return path_1.default.resolve(binPath, 'uv');
    }
    /**
     * 获取当前操作系统的路径
     * @returns {string} - 返回当前操作系统的路径
     */
    get_os_path() {
        let os_path = 'win-';
        if (public_1.pub.is_mac()) {
            os_path = 'darwin-';
        }
        else if (public_1.pub.is_linux()) {
            os_path = 'linux-';
        }
        os_path += process.arch;
        return os_path;
    }
    async download_file(url, saveFile) {
        let abort = new AbortController();
        // 发起下载请求
        let headers = {
            'User-Agent': 'AingDesk/' + public_1.pub.version()
        };
        let downloadBytes = 0;
        if (public_1.pub.file_exists(saveFile)) {
            const stats = public_1.pub.stat(saveFile);
            downloadBytes = stats.size;
        }
        if (downloadBytes > 0) {
            headers['Range'] = `bytes=${downloadBytes}-`;
        }
        try {
            const response = await (0, axios_1.default)({
                url: url,
                method: 'GET',
                headers: headers,
                responseType: 'stream',
                signal: abort.signal,
                // 禁止使用代理
                proxy: false
            });
            // 检查响应头中的Content-Length字段
            const contentLength = response.headers['content-length'];
            // 检查是否已经下载完成
            if (contentLength && downloadBytes >= parseInt(contentLength) || response.status === 416) {
                log_1.logger.info(`文件 ${saveFile} 已经下载完成，跳过下载`);
                return true;
            }
            // 检查响应状态码
            if (response.status !== 200 && response.status !== 206) {
                log_1.logger.error(`下载文件失败，状态码: ${response.status}`);
                return false;
            }
            const writer = fs_1.default.createWriteStream(saveFile, { flags: 'a' });
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    resolve(true);
                });
                writer.on('error', (error) => {
                    reject(error);
                });
            });
        }
        catch (e) {
            if (e.message.indexOf('status code 416') !== -1) {
                log_1.logger.info(`文件 ${saveFile} 已经下载完成，跳过下载`);
                return true;
            }
            return false;
        }
    }
    /**
     * 安装 node.js环境
     * @param args - 参数对象
     */
    async install_npx() {
        let bunFile = this.get_bun_bin();
        if (public_1.pub.file_exists(bunFile)) {
            return public_1.pub.return_success(public_1.pub.lang('已安装'));
        }
        global.bunInstall = true;
        let binPath = this.get_bin_path();
        let os_path = this.get_os_path();
        let downloadUrl = `https://aingdesk.bt.cn/bin/${os_path}/bun.zip`;
        let bunzipFile = path_1.default.resolve(binPath, 'bun.zip');
        this.download_file(downloadUrl, bunzipFile).then(async () => {
            // 解压缩
            let unzip = require('unzipper');
            let unzipStream = fs_1.default.createReadStream(bunzipFile).pipe(unzip.Extract({ path: binPath }));
            return new Promise((resolve, reject) => {
                unzipStream.on('close', () => {
                    // 删除压缩包
                    public_1.pub.delete_file(bunzipFile);
                    // 设置执行权限
                    if (public_1.pub.file_exists(bunFile)) {
                        if (public_1.pub.is_linux() || public_1.pub.is_mac()) {
                            fs_1.default.chmodSync(bunFile, 0o755);
                        }
                        resolve(public_1.pub.return_success(public_1.pub.lang('安装成功')));
                    }
                    else {
                        reject(public_1.pub.return_error(public_1.pub.lang('安装失败')));
                    }
                });
                unzipStream.on('error', (error) => {
                    reject(public_1.pub.return_error(public_1.pub.lang('安装失败'), error));
                });
            });
        });
    }
    /**
     * 清除node.js环境变量
     * @returns {void}
     */
    clear_node_env() {
        let env = process.env;
        let PATH_ARR = env['PATH'].split(";");
        let NEW_PATH_ARR = [];
        for (let key in PATH_ARR) {
            if (PATH_ARR[key].indexOf('node') == -1 && PATH_ARR[key].indexOf('npm') == -1) {
                NEW_PATH_ARR.push(PATH_ARR[key]);
            }
        }
        process.env['PATH'] = NEW_PATH_ARR.join(";");
    }
    /**
     * 保存 MCP 工具列表
     * @param name {string} - 工具名称
     * @param tools {any} - 工具列表
     * @returns
     */
    save_mcp_tools(name, tools) {
        let mcpToolsSavePath = path_1.default.resolve(public_1.pub.get_data_path(), 'mcp_tools');
        if (!public_1.pub.file_exists(mcpToolsSavePath)) {
            public_1.pub.mkdir(mcpToolsSavePath);
        }
        let mcpToolsFile = path_1.default.resolve(mcpToolsSavePath, `${name}.json`);
        try {
            public_1.pub.write_json(mcpToolsFile, tools);
        }
        catch (e) {
            log_1.logger.error(`保存 MCP 工具文件 ${mcpToolsFile} 时出错:`, e);
        }
    }
    /**
     * 读取 MCP 工具列表
     * @param name {string} - 工具名称
     * @returns
     */
    read_mcp_tools(name) {
        let mcpToolsSavePath = path_1.default.resolve(public_1.pub.get_data_path(), 'mcp_tools');
        if (!public_1.pub.file_exists(mcpToolsSavePath)) {
            return [];
        }
        let mcpToolsFile = path_1.default.resolve(mcpToolsSavePath, `${name}.json`);
        if (!public_1.pub.file_exists(mcpToolsFile)) {
            return [];
        }
        try {
            return public_1.pub.read_json(mcpToolsFile);
        }
        catch (e) {
            log_1.logger.error(`读取 MCP 工具文件 ${mcpToolsFile} 时出错:`, e);
            return [];
        }
    }
    /**
     * 同步云端的 MCP 服务器配置
     * @returns {Promise<any>} - 返回同步结果
     */
    async sync_cloud_mcp() {
        let downloadUrl = `https://aingdesk.bt.cn/config/common-mcp-server.json`;
        let res = await public_1.pub.httpRequest(downloadUrl);
        if (res.statusCode !== 200) {
            return public_1.pub.return_error(public_1.pub.lang('获取失败'));
        }
        let commonMcpConfig = res.body;
        if (typeof commonMcpConfig === 'string') {
            commonMcpConfig = JSON.parse(commonMcpConfig);
        }
        if (!commonMcpConfig.mcpServers) {
            return public_1.pub.return_error(public_1.pub.lang('配置文件格式错误'));
        }
        exports.mcpService.save_common_mcp_config(commonMcpConfig);
        return public_1.pub.return_success(public_1.pub.lang('同步成功'));
    }
}
/**
 * 重写 McpService 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
McpService.toString = () => '[class McpService]';
/**
 * 导出 McpService 类的单例实例
 */
exports.mcpService = new McpService();
//# sourceMappingURL=mcp.js.map