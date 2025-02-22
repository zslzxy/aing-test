import ollama from 'ollama';
import Stream from 'stream';
import { ChatService, ChatContext, ChatHistory } from '../service/chat';
import { pub } from '../class/public';
import { logger } from 'ee-core/log';
import { getPromptForWeb } from '../search_engines/search';

/**
 * 定义模型信息的类型
 * @typedef {Object} ModelInfo
 * @property {string} model - 模型名称
 * @property {number} size - 模型大小
 * @property {number} contextLength - 模型的上下文长度
 */
export type ModelInfo = {
    model: string;
    size: number;
    contextLength: number;
};

/**
 * 存储所有模型信息的数组
 * @type {ModelInfo[]}
 */
export let ModelListInfo: ModelInfo[] = [];

/**
 * 存储对话上下文状态的映射，键为对话ID，值为是否继续生成的布尔值
 * @type {Map<string, boolean>}
 */
let ContextStatusMap = new Map<string, boolean>();

/**
 * chat controller 类，处理与聊天相关的各种操作
 * @class
 */
class ChatController {
    /**
     * 获取对话列表
     * @returns {Promise<any>} - 包含对话列表的成功响应
     */
    async get_chat_list(): Promise<any> {
        // 创建 ChatService 实例
        const chatService = new ChatService();
        // 获取对话列表
        const chatList = chatService.get_chat_list();
        // 返回成功响应
        return pub.return_success(pub.lang("对话列表获取成功"), chatList);
    }

    /**
     * 创建新的对话
     * @param {Object} args - 创建对话所需的参数
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.title - 对话标题
     * @returns {Promise<any>} - 包含新对话信息的成功响应
     */
    async create_chat(args: { model: string; parameters: string; title: string }): Promise<any> {
        const { model, parameters, title } = args;
        // 创建新对话并获取相关数据
        const data = new ChatService().create_chat(model, parameters, title);
        // 返回成功响应
        return pub.return_success(pub.lang("对话创建成功"), data);
    }

    /**
     * 获取模型列表
     * @returns {Promise<any>} - 包含模型列表信息的成功响应
     */
    async get_model_list(): Promise<any> {
        // 清空模型信息列表
        ModelListInfo = [];
        try {
            // 获取所有模型信息
            const res = await ollama.list();
            // 遍历模型信息，将其添加到 ModelListInfo 中
            res.models.forEach((modelInfo) => {
                if(modelInfo.name.indexOf('embed') == -1 
                && modelInfo.name.indexOf('bge-m3') == -1  
                && modelInfo.name.indexOf('all-minilm') == -1  
                && modelInfo.name.indexOf('multilingual') == -1) {
                    ModelListInfo.push({
                        model: modelInfo.name,
                        size: modelInfo.size,
                        contextLength: 0
                    });
                }
            });

            // 遍历 ModelListInfo，获取每个模型的详细信息
            for (const info of ModelListInfo) {
                const modelRes = await ollama.show({ model: info.model });
                // 查找上下文长度信息并更新到 ModelListInfo 中
                for (const key in modelRes.model_info) {
                    if (key.indexOf('context_length') !== -1) {
                        info.contextLength = modelRes.model_info[key];
                    }
                }
            }
        } catch (error) {
            // 记录错误信息
            logger.error(pub.lang('获取模型列表时出错:'), error);
        }
        // 返回成功响应
        return pub.return_success(pub.lang("大模型列表获取成功"), ModelListInfo);
    }

    /**
     * 获取指定模型的信息
     * @param {string} model - 模型名称
     * @returns {ModelInfo} - 模型信息对象
     */
    get_model_info(model: string): ModelInfo {
        // 查找匹配的模型信息
        const foundInfo = ModelListInfo.find((info) => info.model === model);
        // 如果找到则返回，否则返回默认信息
        return foundInfo || {
            model,
            size: 0,
            contextLength: 0
        };
    }

    /**
     * 保存对话内容
     * @param {string} uuid - 对话的唯一标识符
     * @param {string} resUUID - 对话的唯一标识符
     * @param {ChatHistory} chatHistoryRes - 对话历史记录
     */
    async set_chat_history(uuid:string,resUUID:string, chatHistoryRes:ChatHistory) {
        // 处理推理内容
        const key = "\n</think>\n";
        if (chatHistoryRes.content.indexOf(key) !== -1) {
            const spArr = chatHistoryRes.content.split(key);
            chatHistoryRes.reasoning = spArr[0] + key;
            chatHistoryRes.content = spArr[1];
        }
        // 保存助手的聊天记录
        const chatService = new ChatService();
        chatService.set_chat_history(uuid,resUUID, chatHistoryRes);
    }



    /**
     * 开始对话
     * @param {Object} args - 对话所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.user_content - 用户输入的内容
     * @param {any} event - 事件对象，用于处理HTTP响应
     * @returns {Promise<any>} - 可读流，用于流式响应对话结果
     */
    async chat(args: { context_id: string; model: string; parameters: string; user_content: string ,search?:string,regenerate_id?:string}, event: any): Promise<any> {
        let { context_id: uuid, model: modelName, parameters, user_content,search,regenerate_id } = args;
        const modelStr = `${modelName}:${parameters}`;
        const chatService = new ChatService();
        // 构建用户的聊天上下文
        const chatContext: ChatContext = {
            role: 'user',
            content: user_content,
            images: [],
            tool_calls: ''
        };

        // 获取模型信息
        let modelInfo = this.get_model_info(modelStr);
        if (modelInfo.contextLength === 0) {
            // 若上下文长度为0，重新获取模型列表并再次获取模型信息
            await this.get_model_list();
            modelInfo = this.get_model_info(modelStr);
        }

        if(modelInfo.contextLength === 0) {
            modelInfo.contextLength = 4096;
        }

        // 保存新的模型信息
        chatService.update_chat_model(uuid, modelName, parameters);

        // 获取对话历史
        const history = chatService.build_chat_history(uuid, chatContext, modelInfo.contextLength).map((context:any) => ({
            role: context.role,
            content: context.content
        }));

        // 保存用户的聊天记录
        const chatHistory: ChatHistory = {
            id: "",
            role: "user",
            reasoning: "",
            stat: {},
            content: user_content,
            images: [],
            tool_calls: "",
            created_at: "",
            create_time: pub.time(),
            tokens: 0,
            search_result:[],
            search_type: search,
            search_query: "", 
        };


        // 初始化助手的聊天记录
        let resUUID = pub.uuid();
        const chatHistoryRes: ChatHistory = {
            id: resUUID,
            role: "assistant",
            reasoning: "",
            stat: {
                model: modelStr,
                created_at: '',
                total_duration: 0,
                load_duration: 0,
                prompt_eval_count: 0,
                prompt_eval_duration: 0,
                eval_count: 0,
                eval_duration: 0,
            },
            content: "",
            images: [],
            tool_calls: "",
            created_at: "",
            create_time: pub.time(),
            tokens: 0,
            search_result:[],
            search_type: search,
            search_query: "", 
        };

        chatService.save_chat_history(uuid, chatHistory,chatHistoryRes, modelInfo.contextLength);
        if (search) {
            // 获取上一次的对话历史
            let lastHistory = "";
            if(history.length > 2) {
                lastHistory += "问题：" + history[history.length - 3].content + "\n";
                lastHistory += "回答：" + history[history.length - 2].content + "\n";
            }

            let {userPrompt,systemPrompt,searchResultList,query } = await getPromptForWeb(user_content,modelStr,lastHistory,search);
            chatHistoryRes.search_query = query;
            chatHistoryRes.search_type = search;
            chatHistoryRes.search_result = searchResultList;

            if (systemPrompt) {
                // 将系统提示词插入到对话历史的第一条
                history.unshift({
                    role: 'system',
                    content: systemPrompt
                });
            }

            if (userPrompt) {
                // 将用户提示词替换历史的最后一条
                history[history.length - 1].content = userPrompt;
            }
        }

        // 发送消息到大模型
        const model = `${modelName}:${parameters}`;
        const res = await ollama.chat({
            model,
            messages: history,
            stream: true
        });

        // 设置对话状态为正在生成
        ContextStatusMap.set(uuid, true);

        // 设置HTTP响应头
        event.response.set("Content-Type", "text/event-stream;charset=utf-8");
        event.response.set("Connection", "keep-alive");
        event.response.status = 200;

        // 创建可读流
        const s = new Stream.Readable({
            read() {}
        });
        
        chatHistoryRes.content = "";

        // 处理大模型的流式响应
        (async () => {
            for await (const chunk of res) {
                if (chunk.done) {
                    // 计算统计信息
                    const resInfo = {
                        model: chunk.model,
                        created_at: chunk.created_at.toString(),
                        total_duration: chunk.total_duration / 1000000000,
                        load_duration: chunk.load_duration / 1000000,
                        prompt_eval_count: chunk.prompt_eval_count,
                        prompt_eval_duration: chunk.prompt_eval_duration / 1000000,
                        eval_count: chunk.eval_count,
                        eval_duration: chunk.eval_duration / 1000000000,
                    };
                    chatHistoryRes.created_at = chunk.created_at.toString();
                    chatHistoryRes.create_time = pub.time();
                    chatHistoryRes.stat = resInfo;

                    // 结束流
                    s.push(null);

                    this.set_chat_history(uuid,resUUID, chatHistoryRes);
                    break;
                }

                // 写入流
                s.push(chunk.message.content);

                // 保存对话内容
                chatHistoryRes.content += chunk.message.content;

                // 检查是否中断生成
                if (!ContextStatusMap.get(uuid)) {
                    // 中断请求
                    res.abort();
                    // 结束流
                    let endContent = pub.lang("\n\n---\n**内容不完整:** 用户手动停止生成");
                    chatHistoryRes.content += endContent;
                    s.push(endContent);
                    s.push(null);
                    this.set_chat_history(uuid,resUUID, chatHistoryRes);
                    break;
                }
            }
        })();

        return s;
    }

    /**
     * 获取指定对话信息
     * @param {Object} args - 获取对话信息所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 包含对话信息的成功响应
     */
    async get_chat_info(args: { context_id: string }): Promise<any> {
        const { context_id: uuid } = args;
        const chatService = new ChatService();
        // 获取对话历史
        const data = chatService.get_chat_history(uuid);
        // 返回成功响应
        return pub.return_success(pub.lang("对话信息获取成功"), data);
    }

    /**
     * 删除指定对话
     * @param {Object} args - 删除对话所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 删除成功的响应
     */
    async remove_chat(args: { context_id: string }): Promise<any> {
        const { context_id: uuid } = args;
        const chatService = new ChatService();
        // 删除对话
        chatService.delete_chat(uuid);
        // 删除对话状态
        if (ContextStatusMap.has(uuid)) {
            ContextStatusMap.delete(uuid);
        }
        // 返回成功响应
        return pub.return_success(pub.lang("对话删除成功"), null);
    }

    /**
     * 修改对话标题
     * @param {Object} args - 修改对话标题所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.title - 新的对话标题
     * @returns {Promise<any>} - 修改结果的响应
     */
    async modify_chat_title(args: { context_id: string; title: string }): Promise<any> {
        const { context_id: uuid, title } = args;
        const chatService = new ChatService();
        // 更新对话标题
        if (chatService.update_chat_title(uuid, title)) {
            return pub.return_success(pub.lang("标题修改成功"), null);
        } else {
            return pub.return_error(pub.lang("标题修改失败"), pub.lang("指定对话不可用"));
        }
    }

    /**
     * 删除指定对话历史
     * @param {Object} args - 删除对话历史所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.id - 要删除的历史记录的唯一标识符
     * @returns {Promise<any>} - 删除成功的响应
     */
    async delete_chat_history(args: { context_id: string; id: string }): Promise<any> {
        const { context_id: uuid, id: history_id } = args;
        const chatService = new ChatService();
        // 删除对话历史记录
        chatService.delete_chat_history(uuid, history_id);
        // 返回成功响应
        return pub.return_success(pub.lang("对话历史删除成功"), null);
    }

    /**
     * 中断生成
     * @param {Object} args - 中断生成所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 中断成功的响应
     */
    async stop_generate(args: { context_id: string }): Promise<any> {
        const { context_id: uuid } = args;
        // 设置对话状态为中断
        ContextStatusMap.set(uuid, false);
        // 返回成功响应
        return pub.return_success(pub.lang("已阻止大模型继续生成内容"), null);
    }

    /**
     * 获取指定对话的最后一条历史记录
     * @param {Object} args - 获取最后一条历史记录所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 包含最后一条历史记录的成功响应
     */
    async get_last_chat_history(args: { context_id: string }): Promise<any> {
        const { context_id: uuid } = args;
        const chatService = new ChatService();
        // 获取最后一条历史记录
        const data = chatService.get_last_chat_history(uuid);
        // 返回成功响应
        return pub.return_success(pub.lang("最后一条历史对话记录获取成功"), data);
    }
}

/**
 * 重写 ChatController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
ChatController.toString = () => '[class ChatController]';

export default ChatController;
