"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("../service/chat");
const public_1 = require("../class/public");
const log_1 = require("ee-core/log");
const model_1 = require("../service/model");
const ollama_1 = require("../service/ollama");
const tochat_1 = require("../service/tochat");
// 模型列表获取重试次数
let MODEL_LIST_RETRY = 0;
/**
 * chat controller 类，处理与聊天相关的各种操作
 * @class
 */
class ChatController {
    /**
     * 获取对话列表
     * @returns {Promise<any>} - 包含对话列表的成功响应
     */
    async get_chat_list() {
        // 创建 ChatService 实例
        const chatService = new chat_1.ChatService();
        // 获取对话列表
        const chatList = chatService.get_chat_list();
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("对话列表获取成功"), chatList);
    }
    /**
     * 创建新的对话
     * @param {Object} args - 创建对话所需的参数
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.title - 对话标题
     * @param {string} args.supplierName - 供应商名称
     * @returns {Promise<any>} - 包含新对话信息的成功响应
     */
    async create_chat(args) {
        let { model, parameters, title, supplierName, agent_name } = args;
        if (!agent_name)
            agent_name = '';
        // 创建新对话并获取相关数据
        const data = new chat_1.ChatService().create_chat(model, parameters, title, supplierName, agent_name);
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("对话创建成功"), data);
    }
    /**
     * 获取常用模型TOP5
     * @param result
     * @returns
     */
    get_model_top5(result) {
        // 增加常用模型
        let commonModels = [];
        let modelsTotal = (0, model_1.getModelUsedTotalList)();
        for (let key of Object.keys(result)) {
            let modelList = result[key];
            for (let model of modelList) {
                let index = `${model.supplierName}/${model.model}`;
                if (modelsTotal[index]) {
                    model.total = modelsTotal[index];
                    commonModels.push(model);
                }
            }
        }
        // 按照使用次数排序
        commonModels = commonModels.sort((a, b) => {
            return b.total - a.total;
        });
        // 取前5个模型
        commonModels = commonModels.slice(0, 5);
        if (commonModels.length > 0) {
            result['commonModelList'] = commonModels;
        }
        return result;
    }
    /**
     * 获取模型列表
     * @returns {Promise<any>} - 包含模型列表信息的成功响应
     */
    async get_model_list() {
        // 清空模型信息列表
        (0, tochat_1.clearModelListInfo)();
        let ollamaModelList = await ollama_1.ollamaService.model_list();
        try {
            // 获取所有模型信息
            MODEL_LIST_RETRY++;
            const ollama = public_1.pub.init_ollama();
            const res = await ollama.list();
            // 遍历模型信息，将其添加到 ModelListInfo 中
            res.models.forEach((modelInfo) => {
                if (modelInfo.name.indexOf('embed') == -1
                    && modelInfo.name.indexOf('bge-m3') == -1
                    && modelInfo.name.indexOf('all-minilm') == -1
                    && modelInfo.name.indexOf('multilingual') == -1
                    && modelInfo.name.indexOf('r1-1776') == -1) {
                    let capability = ['llm'];
                    let lastName = modelInfo.name.split(':')[0].toLocaleLowerCase();
                    for (let mod of ollamaModelList) {
                        if (mod.model == lastName) {
                            capability = mod.capability;
                            break;
                        }
                    }
                    tochat_1.ModelListInfo.push({
                        title: "Ollama/" + modelInfo.name,
                        supplierName: 'ollama',
                        model: modelInfo.name,
                        size: modelInfo.size,
                        contextLength: 0,
                        capability: capability
                    });
                }
            });
        }
        catch (error) {
            // 重试3次
            if (MODEL_LIST_RETRY < 4) {
                await public_1.pub.sleep(1000);
                return this.get_model_list();
            }
            // 记录错误信息
            log_1.logger.error(public_1.pub.lang('获取模型列表时出错:'), error);
        }
        let result = await (0, model_1.GetSupplierModels)();
        result['ollama'] = tochat_1.ModelListInfo;
        // 计算常用模型
        result = this.get_model_top5(result);
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("大模型列表获取成功"), result);
    }
    /**
     * 开始对话
     * @param {Object} args - 对话所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.supplierName - 供应商名称
     * @param {string} args.model - 模型名称
     * @param {string} args.parameters - 模型参数
     * @param {string} args.user_content - 用户输入的内容
     * @param {string} args.search - 搜索类型
     * @param {string} args.rag_list - RAG列表
     * @param {string} args.regenerate_id - 重新生成的ID
     * @param {string} args.images - 图片列表
     * @param {string} args.doc_files - 文件列表
     * @param {string} args.temp_chat - 临时对话标志
     * @param {any} args.rag_results - RAG结果列表
     * @param {any} args.search_results - 搜索结果列表
     * @param {string} args.compare_id - 对比ID
     * @param {any} event - 事件对象，用于处理HTTP响应
     * @returns {Promise<any>} - 可读流，用于流式响应对话结果
     */
    async chat(args, event) {
        let toChatService = new tochat_1.ToChatService();
        return await toChatService.chat(args, event);
    }
    /**
     * 获取指定对话信息
     * @param {Object} args - 获取对话信息所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 包含对话信息的成功响应
     */
    async get_chat_info(args) {
        const { context_id: uuid } = args;
        let chatService = new chat_1.ChatService();
        // 获取对话历史
        const data = chatService.get_chat_history(uuid);
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("对话信息获取成功"), data);
    }
    /**
     * 删除指定对话
     * @param {Object} args - 删除对话所需的参数
     * @param {string} args.context_id - 对话的唯一标识符,多个用逗号分隔
     * @returns {Promise<any>} - 删除成功的响应
     */
    async remove_chat(args) {
        let { context_id } = args;
        const chatService = new chat_1.ChatService();
        // 删除对话
        let uuids = context_id.split(',');
        for (let uuid of uuids) {
            chatService.delete_chat(uuid);
            // 删除对话状态
            if (tochat_1.ContextStatusMap.has(uuid)) {
                tochat_1.ContextStatusMap.delete(uuid);
            }
        }
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("对话删除成功"), null);
    }
    /**
     * 修改对话标题
     * @param {Object} args - 修改对话标题所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.title - 新的对话标题
     * @returns {Promise<any>} - 修改结果的响应
     */
    async modify_chat_title(args) {
        const { context_id: uuid, title } = args;
        const chatService = new chat_1.ChatService();
        // 更新对话标题
        if (chatService.update_chat_title(uuid, title)) {
            return public_1.pub.return_success(public_1.pub.lang("标题修改成功"), null);
        }
        else {
            return public_1.pub.return_error(public_1.pub.lang("标题修改失败"), public_1.pub.lang("指定对话不可用"));
        }
    }
    /**
     * 删除指定对话历史
     * @param {Object} args - 删除对话历史所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @param {string} args.id - 要删除的历史记录的唯一标识符
     * @returns {Promise<any>} - 删除成功的响应
     */
    async delete_chat_history(args) {
        const { context_id: uuid, id: history_id } = args;
        const chatService = new chat_1.ChatService();
        // 删除对话历史记录
        chatService.delete_chat_history(uuid, history_id);
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("对话历史删除成功"), null);
    }
    /**
     * 中断生成
     * @param {Object} args - 中断生成所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 中断成功的响应
     */
    async stop_generate(args) {
        const { context_id: uuid } = args;
        // 设置对话状态为中断
        tochat_1.ContextStatusMap.set(uuid, false);
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("已阻止大模型继续生成内容"), null);
    }
    /**
     * 获取指定对话的最后一条历史记录
     * @param {Object} args - 获取最后一条历史记录所需的参数
     * @param {string} args.context_id - 对话的唯一标识符
     * @returns {Promise<any>} - 包含最后一条历史记录的成功响应
     */
    async get_last_chat_history(args) {
        const { context_id: uuid } = args;
        const chatService = new chat_1.ChatService();
        // 获取最后一条历史记录
        const data = chatService.get_last_chat_history(uuid);
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang("最后一条历史对话记录获取成功"), data);
    }
}
/**
 * 重写 ChatController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
ChatController.toString = () => '[class ChatController]';
exports.default = ChatController;
//# sourceMappingURL=chat.js.map