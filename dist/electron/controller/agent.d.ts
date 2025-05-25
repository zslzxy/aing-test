/**
 * agent controller 类，处理与智能体相关的各种操作
 * @class
 */
declare class AgentController {
    private agentPath;
    private systemAgentPath;
    constructor();
    /**
     * 读取指定知能体配置文件
     * @returns object
     */
    read_agent_config(agent_name: string): any;
    /**
     * 写入指定知能体配置文件
     * @param agent_name - 智能体名称
     * @param config - 配置信息
     * @returns
     */
    write_agent_config(agent_name: string, config: object): void;
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
    create_agent(args: {
        agent_type?: string;
        agent_name?: string;
        agent_title: string;
        prompt: string;
        icon?: string;
    }): Promise<any>;
    /**
     * 获取智能体列表
     * @param args
     * @param args.agent_type - 智能体分类
     * @returns {Promise<any>}
     */
    get_agent_list(args: {
        agent_type?: string;
    }): Promise<any>;
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
    modify_agent(args: {
        agent_type?: string;
        agent_name: string;
        agent_title: string;
        prompt: string;
        icon?: string;
    }): Promise<any>;
    /**
     * 删除智能体
     * @param args
     * @param args.agent_name - 智能体名称
     * @returns {Promise<void>}
     */
    remove_agent(args: {
        agent_name: string;
    }): Promise<any>;
    /**
     * 获取指定一条智能体信息
     * @param args
     * @param args.agent_name - 智能体名称
     * @returns {Promise<void>}
     */
    get_agent_info(args: {
        agent_name: string;
    }): Promise<any>;
}
export default AgentController;
