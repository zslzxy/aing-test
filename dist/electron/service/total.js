"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalService = void 0;
const public_1 = require("../class/public");
const https_1 = __importDefault(require("https"));
const querystring_1 = __importDefault(require("querystring"));
const log_1 = require("ee-core/log");
class TotalService {
    apiDomain = 'api.aingdesk.com';
    // 统计安装量和日活跃量
    async total() {
        let data = querystring_1.default.stringify({
            "version": public_1.pub.version(), // 版本号
            "os_type": public_1.pub.os_type(), // 操作系统类型  windows,mac,linux
            "client_id": public_1.pub.client_id(), // 64位客户端唯一标识
        });
        // User-Agent
        let userAgent = "AingDesk/" + public_1.pub.version() + " (" + public_1.pub.os_type() + ")";
        // 请求配置
        let options = {
            hostname: this.apiDomain,
            port: 443,
            path: '/client/total',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length,
                'User-Agent': userAgent
            }
        };
        // 发送请求
        let req = https_1.default.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (data) => {
                // logger.info("res:",data);
                let result = JSON.parse(data);
                if (result.status === true) {
                    if (result.data && result.data.shareid_prefix) {
                        // 如果配置中没有设置分享ID前缀，则使用接口返回的前缀，避免分享ID冲突
                        if (!public_1.pub.C('shareIdPrefix')) {
                            public_1.pub.C('shareIdPrefix', result.data.shareid_prefix);
                        }
                        global.area = result.data.area;
                    }
                }
            });
        });
        req.on('error', (e) => {
            log_1.logger.warn(e);
        });
        // 写入数据到请求主体
        req.write(data);
        // 结束请求
        req.end();
    }
    // 启动统计服务，每天统计一次
    async start() {
        this.total(); // 每次启动时先统计一次
        setInterval(() => {
            this.total();
        }, 86400);
    }
}
/**
 * 重写 TotalService 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
TotalService.toString = () => '[class TotalService]';
/**
 * 导出 TotalService 类的单例实例
 */
exports.totalService = new TotalService();
//# sourceMappingURL=total.js.map