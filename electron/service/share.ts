import fs from 'fs';
import tls from 'tls';
import ollama from 'ollama';
import { pub } from '../class/public';
import path from 'path';
import { logger } from 'ee-core/log';
import { shareChatService } from './share_chat';
import { ChatContext, ChatHistory } from './chat';
import ChatController from '../controller/chat';
import {getPromptForWeb} from '../search_engines/search'

// 常量定义
const CLOUD_SERVER_HOST = 'share.aingdesk.com';
const CLOUD_SERVER_PORT = 9999;
const HEADER_SIZE = 4;

// 存储需要中断的对话 ID
let ContextStatusMap = new Map<string, boolean>();

class ShareService {
    // 获取对话列表
    getShareChatList(shareId: string) {
        const chatPath = path.resolve(pub.get_data_path(), 'share', shareId, 'context');
        const chatList = pub.readdir(chatPath);
        const chatHistoryList: object[] = [];

        for (const contextId of chatList) {
            const chatFilePath = path.resolve(chatPath, contextId);
            const chatConfigFile = path.resolve(chatFilePath, 'config.json');
            const chatConfigBody = pub.read_file(chatConfigFile);
            if (chatConfigBody) {
                try {
                    chatHistoryList.push(JSON.parse(chatConfigBody));
                } catch (error) {
                    logger.error(`Failed to parse chat config file: ${chatConfigFile}`, error);
                }
            }
        }

        // 按照创建时间倒序排序
        chatHistoryList.sort((a: any, b: any) => b.create_time - a.create_time);

        return pub.return_success('获取成功', chatHistoryList);
    }

    // 获取指定对话信息
    getShareChatInfo(shareId: string, contextId: string) {
        const chatPath = path.resolve(pub.get_data_path(), 'share', shareId, 'context', contextId);
        const chatConfigFile = path.resolve(chatPath, 'config.json');
        const chatConfigBody = pub.read_file(chatConfigFile);
        const chatInfo = chatConfigBody ? JSON.parse(chatConfigBody) : null;
        if (!chatInfo) {
            return pub.return_error(pub.lang('获取失败'), null);
        }


        const chatHistoryFile = path.resolve(chatPath, 'history.json');
        const chatHistoryBody = pub.read_file(chatHistoryFile);
        if (chatHistoryBody) {


            try {
                chatInfo.history = JSON.parse(chatHistoryBody);
                return pub.return_success(pub.lang('获取成功'), chatInfo);
            } catch (error) {
                logger.error(`Failed to parse chat history file: ${chatHistoryFile}`, error);
                return pub.return_error(pub.lang('获取失败'), null);
            }
        }
        return pub.return_error(pub.lang('获取失败'), null);
    }

    // 创建新对话
    createChat(shareId: string,title:string) {
        const shareInfo = this.getShareInfo(shareId);
        if (!shareInfo) {
            return pub.return_error(pub.lang('分享 ID 不存在'), null);
        }

        const contextId = pub.uuid();
        const chatPath = path.resolve(pub.get_data_path(), 'share', shareId, 'context', contextId);
        if (!pub.file_exists(chatPath)) {
            pub.mkdir(chatPath);
        }

        const chatConfig = {
            title,
            shareId,
            contextId,
            model: shareInfo.model,
            parameters: shareInfo.parameters,
            create_time: pub.time(),
            update_time: pub.time(),
        };

        const chatConfigFile = path.resolve(chatPath, 'config.json');
        pub.write_file(chatConfigFile, JSON.stringify(chatConfig));
        return pub.return_success('创建成功', { shareId, contextId });
    }

    // 删除对话
    removeChat(shareId: string, contextId: string) {
        const chatPath = path.resolve(pub.get_data_path(), 'share', shareId, 'context', contextId);
        if (pub.file_exists(chatPath)) {
            pub.rmdir(chatPath);
        }
        return pub.return_success(pub.lang('删除成功'));
    }

    // 中断对话
    abortChat(contextId: string) {
        return pub.return_error(pub.lang('暂不支持远程中断'), null);
        // ContextStatusMap.set(contextId, false);
        // return pub.return_success(pub.lang('中断成功'));
    }

    
    // 聊天
    async chat(conn: tls.TLSSocket, data: { modelStr: string; content: string; shareInfo: any; contextId: string;search?:string,regenerate_id?:string },msgId:number) {
        const { modelStr, content, shareInfo, contextId,search,regenerate_id } = data;
        const shareId = shareInfo.share_id;

        // 构建用户的聊天上下文
        const chatContext: ChatContext = {
            role: 'user',
            content,
            images: [],
            tool_calls: '',
        };

        // 获取模型信息
        const chatController = new ChatController();
        let modelInfo = chatController.get_model_info(modelStr);
        if (modelInfo.contextLength === 0) {
            await chatController.get_model_list();
            modelInfo = chatController.get_model_info(modelStr);
        }
        modelInfo.contextLength = modelInfo.contextLength || 4096;
        // 设置对话状态为正在生成
        ContextStatusMap.set(contextId, true);
        // 保存新的模型信息
        shareChatService.update_chat_model(shareId, contextId, shareInfo.model, shareInfo.parameters);

        // 获取对话历史
        const history = shareChatService.build_chat_history(shareId, contextId, chatContext, modelInfo.contextLength).map((context: any) => ({
            role: context.role,
            content: context.content,
        }));

        // 保存用户的聊天记录
        const chatHistory: ChatHistory = {
            id: '',
            role: 'user',
            reasoning: '',
            stat: {},
            content,
            images: [],
            tool_calls: '',
            created_at: '',
            create_time: pub.time(),
            tokens: 0,
            search_result:[],
            search_query:"",
            search_type:search
        };

        // 初始化助手的聊天记录
        const resUUID = pub.uuid();
        const chatHistoryRes: ChatHistory = {
            id: resUUID,
            role: 'assistant',
            reasoning: '',
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
            content: '',
            images: [],
            tool_calls: '',
            created_at: '',
            create_time: pub.time(),
            tokens: 0,
            search_result:[],
            search_query:"",
            search_type:search,
        };

        shareChatService.save_chat_history(shareId, contextId, chatHistory, chatHistoryRes, modelInfo.contextLength,regenerate_id);
        chatHistoryRes.content = '';

        if (search) {
            // 获取上一次的对话历史
            let lastHistory = "";
            if(history.length > 2) {
                lastHistory += pub.lang("问题: ") + history[history.length - 3].content + "\n";
                lastHistory += pub.lang("回答:") + history[history.length - 2].content + "\n";
            }

            let {userPrompt,systemPrompt,searchResultList,query } = await getPromptForWeb(content,modelStr,lastHistory,search);
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
        const model = `${shareInfo.model}:${shareInfo.parameters}`;
        try {
            const res = await ollama.chat({
                model,
                messages: history,
                stream: true,
            });

            // 处理大模型的流式响应
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

                    shareChatService.set_chat_history(shareId, contextId, resUUID, chatHistoryRes);
                    this.sendToServer(conn, { done: true, content: chunk.message.content},msgId);
                    break;
                }

                // 写入流
                this.sendToServer(conn, { done: false, content: chunk.message.content },msgId);

                // 保存对话内容
                chatHistoryRes.content += chunk.message.content;

                // 检查是否中断生成
                if (!ContextStatusMap.get(contextId)) {
                    console.log('中断请求');
                    // 中断请求
                    res.abort();
                    // 结束流
                    const endContent = pub.lang('\n\n---\n**内容不完整:** 用户手动停止生成');
                    chatHistoryRes.content += endContent;
                    this.sendToServer(conn, { done: true, content: endContent },msgId);
                    shareChatService.set_chat_history(shareId, contextId, resUUID, chatHistoryRes);
                    break;
                }
            }
        } catch (error) {
            logger.error('Error while chatting with Ollama:', error);
            this.sendToServer(conn, pub.return_error(pub.lang('聊天出错'), null),msgId);
        }
    }

    // 判断分享 ID 是否存在
    existsShareId(shareId: string) {
        return pub.file_exists(path.resolve(pub.get_data_path(), 'share', shareId));
    }

    // 获取分享配置
    getShareInfo(shareId: string) {
        if (!this.existsShareId(shareId)) {
            return null;
        }

        const sharePath = path.resolve(pub.get_data_path(), 'share', shareId);
        const shareConfigPath = path.resolve(sharePath, 'config.json');
        const shareConfig = pub.read_file(shareConfigPath);
        if (!shareConfig) {
            return null;
        }

        try {
            return typeof shareConfig === 'string' ? JSON.parse(shareConfig) : shareConfig;
        } catch (error) {
            logger.error(`Failed to parse share config file: ${shareConfigPath}`, error);
            return null;
        }
    }


    // 生成唯一的分享 ID 前缀
    generateUniquePrefix() {
        return pub.C('shareIdPrefix') || 'none';
    }

    // 发送数据到云服务器
    sendToServer(conn: tls.TLSSocket, data: any,msgId:number) {
        let dataStr = data;
        if (typeof data == 'object') {
            // 添加消息 ID
            data.msgId = msgId;
            dataStr = JSON.stringify(data);
        }

        // 构建头部
        const header = Buffer.alloc(HEADER_SIZE);
        const bodyBuffer = Buffer.from(dataStr);
        header.writeInt32BE(bodyBuffer.length);

        // 先发送头部
        conn.write(header);

        // 分包发送，每个包 4096 字节
        const packageSize = 4096;
        const packageCount = Math.ceil(bodyBuffer.length / packageSize);
        for (let i = 0; i < packageCount; i++) {
            const start = i * packageSize;
            const end = Math.min(start + packageSize, bodyBuffer.length);
            const packageData = bodyBuffer.slice(start, end);
            conn.write(packageData);
        }
    }

    // 处理接收到的数据
    handleReceivedData(conn, data) {
        try {
            const shareData = JSON.parse(data.toString('utf8'));
            if (!shareData.msgId) {
                return this.sendToServer(conn, pub.return_error('Unknown msgId', 'Unknown msgId'), 0);
            }
            if (!shareData) {
                return this.sendToServer(conn, pub.return_error('args error', 'args error'), shareData.msgId);
            }
            if (!shareData.action) {
                return this.sendToServer(conn, pub.return_error('Unknown action', 'Unknown action'), shareData.msgId);
            }
            if (shareData.action === 'set_share_id_prefix') {
                pub.C('shareIdPrefix', shareData.shareIdPrefix);
                return;
            }
            if (!this.existsShareId(shareData.shareId)) {
                return this.sendToServer(conn, pub.return_error('Unknown shareId', 'Unknown shareId'), shareData.msgId);
            }

            const shareInfo = this.getShareInfo(shareData.shareId);

            switch (shareData.action) {
                case 'chat':
                    const args = {
                        modelStr: `${shareInfo.model}:${shareInfo.parameters}`,
                        content: shareData.content,
                        shareInfo,
                        contextId: shareData.contextId
                    };
                    this.chat(conn, args, shareData.msgId);
                    break;
                case 'get_share_chat_list':
                    const chatList = this.getShareChatList(shareData.shareId);
                    this.sendToServer(conn, chatList, shareData.msgId);
                    break;
                case 'get_share_chat_info':
                    if (!shareData.contextId) {
                        return this.sendToServer(conn, pub.return_error('Unknown contextId', 'Unknown contextId'), shareData.msgId);
                    }
                    const chatInfo = this.getShareChatInfo(shareData.shareId, shareData.contextId);
                    this.sendToServer(conn, chatInfo, shareData.msgId);
                    break;
                case 'create_chat':
                    if (!shareData.title) {
                        return this.sendToServer(conn, pub.return_error('Unknown title', 'Unknown title'), shareData.msgId);
                    }
                    const chatRes = this.createChat(shareData.shareId, shareData.title);
                    this.sendToServer(conn, chatRes, shareData.msgId);
                    break;
                case 'remove_chat':
                    if (!shareData.contextId) {
                        return this.sendToServer(conn, pub.return_error('Unknown contextId', 'Unknown contextId'), shareData.msgId);
                    }
                    const removeRes = this.removeChat(shareData.shareId, shareData.contextId);
                    this.sendToServer(conn, removeRes, shareData.msgId);
                    break;
                case 'stop_generate':
                    if (!shareData.contextId) {
                        return this.sendToServer(conn, pub.return_error('Unknown contextId', 'Unknown contextId'), shareData.msgId);
                    }
                    const abortRes = this.abortChat(shareData.contextId);
                    this.sendToServer(conn, abortRes, shareData.msgId);
                    break;
                case 'modify_chat_title':
                    if (!shareData.title) {
                        return this.sendToServer(conn, pub.return_error('Unknown title', 'Unknown title'), shareData.msgId);
                    }
                    if (!shareData.contextId) {
                        return this.sendToServer(conn, pub.return_error('Unknown contextId', 'Unknown contextId'), shareData.msgId);
                    }
                    shareChatService.update_chat_title(shareData.shareId, shareData.contextId, shareData.title);
                    this.sendToServer(conn, pub.return_success(pub.lang('修改成功')), shareData.msgId);
                    break;
                case 'get_last_chat_history':
                    if (!shareData.contextId) {
                        return this.sendToServer(conn, pub.return_error('Unknown contextId', 'Unknown contextId'), shareData.msgId);
                    }
                    const lastChatHistory = shareChatService.get_last_chat_history(shareData.shareId, shareData.contextId);
                    this.sendToServer(conn, pub.return_success(pub.lang('获取成功'), lastChatHistory), shareData.msgId);
                    break;
                default:
                    this.sendToServer(conn, pub.return_error('Unknown action', null), shareData.msgId);
                    break;
            }
        } catch (error) {
            logger.error('Error while handling received data:', error);
            this.sendToServer(conn, pub.return_error('Data parse error', 'Data parse error'), 0);
        }
    }

    // 接收数据
    receiveData(conn) {
        let buffer = Buffer.alloc(0);
        let bodySize:any = null;
        conn.on('data', (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);

            while (true) {
                if (bodySize === null) {
                    // 检查是否接收到完整的头部
                    if (buffer.length >= 4) {
                        bodySize = buffer.readUInt32BE(0);
                        buffer = buffer.slice(4);
                    } else {
                        break;
                    }
                }

                if (bodySize !== null && buffer.length >= bodySize) {
                    // 接收到完整的数据体
                    const body = buffer.slice(0, bodySize);
                    buffer = buffer.slice(bodySize);
                    this.handleReceivedData(conn, body);
                    bodySize = null;
                } else {
                    break;
                }
            }
        });
    }

    // 连接到云服务器
    connectToCloudServer(shareIdPrefix) {
        global.connectToCloudServer = false;

        if (pub.C('shareServiceStatus') === false) {
            return null;
        }

        // 检查 share 目录是否存在
        const sharePath = path.resolve(pub.get_data_path(), "share");
        if (!pub.file_exists(sharePath)) {
            return null;
        }

        // 检查是否有可用的分享
        const shareList = pub.readdir(sharePath);
        if (!shareList || shareList.length === 0) {
            return null;
        }

        const certFile = path.resolve(pub.get_resource_path(), 'cert/server.crt');
        const options = {
            host: CLOUD_SERVER_HOST,
            port: CLOUD_SERVER_PORT,
            ca: fs.readFileSync(certFile),
            rejectUnauthorized: false,
            // timeout: 5000 // 5 秒超时
        };

        const socket = tls.connect(options, () => {
            logger.info('Connected to cloud server');
            // 发送分享 ID 前缀
            this.sendToServer(socket, shareIdPrefix, 0);
        });

        socket.on('timeout', () => {
            logger.error('Connection timed out');
            socket.destroy();
        });

        if (socket) global.connectToCloudServer = true;

        // 接收数据
        this.receiveData(socket);

        // 监听连接关闭事件
        socket.on('end', () => {
            logger.info('Disconnected from cloud server');
        });

        // 监听错误事件
        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });

        // 监听关闭事件
        socket.on('close', (hadError) => {
            if (hadError) {
                logger.error('Socket closed with error');
            } else {
                logger.info('Socket closed normally');
            }
        });

        return socket;
    }

    // 开始重连
    startReconnect(socket, shareIdPrefix) {
        // 每隔 5 秒检查一次连接状态
        setInterval(() => {
            if (!socket || socket.destroyed) {
                socket = this.connectToCloudServer(shareIdPrefix);
            }
        }, 5000);
    }
}

/**
 * 重写 ShareService 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
ShareService.prototype.toString = () => '[class ShareService]';

/**
 * 导出 ShareService 类的单例实例
 */
export const shareService = new ShareService();