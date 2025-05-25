"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentService = exports.AgentService = void 0;
const public_1 = require("../class/public");
const path_1 = __importDefault(require("path"));
const log_1 = require("ee-core/log");
/**
 * 智能体服务类，提供与智能体相关的各种操作
 */
class AgentService {
    // 读取智能体配置
    get_agent_config(agent_name) {
        let agentPath = path_1.default.resolve(public_1.pub.get_data_path(), 'agent');
        let systemAgentPath = path_1.default.resolve(public_1.pub.get_resource_path(), 'agent');
        let agentConfigFile = path_1.default.resolve(agentPath, agent_name + '.json');
        if (public_1.pub.file_exists(agentConfigFile)) {
            try {
                let agentConfig = public_1.pub.read_json(agentConfigFile);
                return agentConfig;
            }
            catch (e) {
                log_1.logger.error(public_1.pub.lang('读取智能体配置文件失败'), e);
                return null;
            }
        }
        let systemAgentConfigFile = path_1.default.resolve(systemAgentPath, agent_name + '.json');
        if (public_1.pub.file_exists(systemAgentConfigFile)) {
            try {
                let agentConfig = public_1.pub.read_json(systemAgentConfigFile);
                return agentConfig;
            }
            catch (e) {
                log_1.logger.error(public_1.pub.lang('读取智能体配置文件失败'), e);
                return null;
            }
        }
        return null;
    }
}
exports.AgentService = AgentService;
/**
 * 重写 AgentService 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
AgentService.toString = () => '[class AgentService]';
/**
 * 导出 AgentService 类的单例实例
 */
exports.agentService = new AgentService();
//# sourceMappingURL=agent.js.map