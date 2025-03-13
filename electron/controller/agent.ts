import {pub} from '../class/public';
import {logger} from 'ee-core/log';
import path from 'path';


/**
 * agent controller 类，处理与智能体相关的各种操作
 * @class
 */
class AgentController {
    private agentPath = path.resolve(pub.get_data_path(), 'agent');
    

    /**
     * 创建智能体
     * @param args
     * @param args.agentName - 智能体名称
     */
    async create_agent(args:{}){

    }




}

/**
 * 重写 AgentController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
AgentController.toString = () => '[class AgentController]';

export default AgentController;
