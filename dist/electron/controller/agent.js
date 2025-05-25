"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const public_1 = require("../class/public");
const log_1 = require("ee-core/log");
const path_1 = __importDefault(require("path"));
//const DEFAULT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAnpJREFUWEfVl0FuGjEUhv83ZNElIQcoSJ1I3eUIcIiuE9TV0E17goQbZFNYVZCTwDI3iBQqZS7QKfuCX2UbBzNjjz0katTZId74ff79v+c3hDd+6I3zoxHA2ffHqxDwNqEc2OTr7GMeipX/BwFkUiZcA9SNWdDEMLBMmO9+fTmf171XC3A6WS0I6DdJXIklmgv8GfsU8QK8SvJnGs4FbQcuCCdAZ7q6BuPGlpMJ43WWLmPUaE9X/QR0Cea9Zwg3RZaOy+9XANrTh27CJ08mkJiHoXP0QZU3ImjTK6tQAbBfkkb6PUoHMbv2Qkwen4yBXZtxAPycGekEYWBkV2Cgbp2hlHo4uZQwRm5dRTRTgETzIvswtGEVQGeqk0pCu+SKUar+Dy1iFjTryN8G3j5SU5oKaOcJsgM0wI5W7uIFALbcncmKbU+ZHBKS7N39awCZ7/8AUHXNWPiM5PJAzBEoBbQHWgvpcJ8J7Ri7Msqltz/Ow85newAsfoCSz9qom55yuelcAnyXMM9M3boaxzE9YQdwz8A7ABcyqQC+rUfpbXQfiE0s1WqJ1vMFxgm9B3Ebgr7qNaQ6NDT9pQJwWPPu/l0H07E6XznO1Vndl5G1SNNjMB1TG1asSeg5ggmbIks/BS+jSueT6zAPt8l2GTvl6O56eKP6zOudB8oLqF0AweuYwN3K9OS5ipVIded57Dhmr1lXtkEAXaL6hmNG37k7xw6kUkRYugaQKA/EltxrxAWn4gNXN87IeUiFIMDLhlPOi9F5r447COCqhlghQgaMMuG+puWEG/9xEjvMBhWwdysvrZaQde5/5KdZ7PgerUCs5MfENVLgmAShd/4C9STGNsWb898AAAAASUVORK5CYII=';
/**
 * agent controller 类，处理与智能体相关的各种操作
 * @class
 */
class AgentController {
    agentPath = path_1.default.resolve(public_1.pub.get_data_path(), 'agent');
    systemAgentPath = path_1.default.resolve(public_1.pub.get_resource_path(), 'agent');
    constructor() {
        if (!public_1.pub.file_exists(this.agentPath)) {
            public_1.pub.mkdir(this.agentPath);
        }
    }
    /**
     * 读取指定知能体配置文件
     * @returns object
     */
    read_agent_config(agent_name) {
        let agentConfigFile = path_1.default.resolve(this.agentPath, agent_name + '.json');
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
        let systemAgentConfigFile = path_1.default.resolve(this.systemAgentPath, agent_name + '.json');
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
    /**
     * 写入指定知能体配置文件
     * @param agent_name - 智能体名称
     * @param config - 配置信息
     * @returns
     */
    write_agent_config(agent_name, config) {
        let agentConfigFile = path_1.default.resolve(this.agentPath, agent_name + '.json');
        public_1.pub.write_json(agentConfigFile, config);
    }
    /**
     * 创建智能体
     * @param args
     * @param args.agent_type - 智能体分类
     * @param args.agent_name - 智能体名称
     * @param args.agent_title - 智能体标题
     * @param args.prompt - 智能体提示
     * @param args.icon - 智能体图标
     * @returns {Promise<any>}
     */
    async create_agent(args) {
        let { agent_type, agent_name, agent_title, prompt, icon } = args;
        if (!agent_name) {
            while (true) {
                agent_name = public_1.pub.randomString(8);
                let agentConfigFile = path_1.default.resolve(this.agentPath, agent_name + '.json');
                if (!public_1.pub.file_exists(agentConfigFile)) {
                    break;
                }
            }
        }
        if (!agent_type) {
            agent_type = 'default';
        }
        if (!icon) {
            icon = "";
        }
        let agentConfig = {
            agent_name: agent_name,
            agent_title: agent_title,
            prompt: prompt,
            msg: '',
            agent_type: agent_type,
            icon: icon,
            create_time: public_1.pub.time(),
            is_system: false
        };
        this.write_agent_config(agent_name, agentConfig);
        return public_1.pub.return_success(public_1.pub.lang('创建成功'));
    }
    /**
     * 获取智能体列表
     * @param args
     * @param args.agent_type - 智能体分类
     * @returns {Promise<any>}
     */
    async get_agent_list(args) {
        let agentList = [];
        let systemAgentDirList = public_1.pub.readdir(this.systemAgentPath);
        for (let agentDir of systemAgentDirList) {
            let agentName = path_1.default.basename(agentDir, '.json');
            let agentConfig = this.read_agent_config(agentName);
            if (agentConfig) {
                agentList.push(agentConfig);
            }
        }
        let agentDirList = public_1.pub.readdir(this.agentPath);
        for (let agentDir of agentDirList) {
            let agentName = path_1.default.basename(agentDir, '.json');
            let agentConfig = this.read_agent_config(agentName);
            if (agentConfig) {
                agentList.push(agentConfig);
            }
        }
        // 根据create_time降序排序
        agentList = agentList.sort((a, b) => {
            return b.create_time - a.create_time;
        });
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), agentList);
    }
    /**
     * 修改智能体
     * @param args
     * @param args.agent_type - 智能体分类
     * @param args.agent_name - 智能体名称
     * @param args.agent_title - 智能体标题
     * @param args.prompt - 智能体提示
     * @param args.icon - 智能体图标
     * @returns {Promise<any>}
     */
    async modify_agent(args) {
        let { agent_type, agent_name, agent_title, prompt, icon } = args;
        let agentConfig = this.read_agent_config(agent_name);
        if (!agentConfig) {
            return public_1.pub.return_error(public_1.pub.lang('智能体不存在'));
        }
        if (agentConfig.is_system) {
            return public_1.pub.return_error(public_1.pub.lang('系统智能体不可修改'));
        }
        if (agent_type) {
            agentConfig.agent_type = agent_type;
        }
        agentConfig.agent_title = agent_title;
        agentConfig.prompt = prompt;
        if (icon) {
            agentConfig.icon = icon;
        }
        this.write_agent_config(agent_name, agentConfig);
        return public_1.pub.return_success(public_1.pub.lang('修改成功'));
    }
    /**
     * 删除智能体
     * @param args
     * @param args.agent_name - 智能体名称
     * @returns {Promise<void>}
     */
    async remove_agent(args) {
        let { agent_name } = args;
        let agentConfig = this.read_agent_config(agent_name);
        if (!agentConfig) {
            return public_1.pub.return_error(public_1.pub.lang('智能体不存在'));
        }
        if (agentConfig.is_system) {
            return public_1.pub.return_error(public_1.pub.lang('系统智能体不可删除'));
        }
        let agentConfigFile = path_1.default.resolve(this.agentPath, agent_name + '.json');
        public_1.pub.delete_file(agentConfigFile);
        return public_1.pub.return_success(public_1.pub.lang('删除成功'));
    }
    /**
     * 获取指定一条智能体信息
     * @param args
     * @param args.agent_name - 智能体名称
     * @returns {Promise<void>}
     */
    async get_agent_info(args) {
        let { agent_name } = args;
        let agentConfig = this.read_agent_config(agent_name);
        if (!agentConfig) {
            return public_1.pub.return_error(public_1.pub.lang('智能体不存在'));
        }
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), agentConfig);
    }
}
/**
 * 重写 AgentController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
AgentController.toString = () => '[class AgentController]';
exports.default = AgentController;
//# sourceMappingURL=agent.js.map