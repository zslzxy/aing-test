import { nextTick, ref } from "vue"
import { post } from "@/api"
import axios from "axios"
import { eventBUS } from "@/views/Home/utils/tools"
import { sendLog } from "@/views/Home/controller"
import { create_chat, getChatInfo } from "@/views/Sider/controller"
import { message, } from "@/utils/naive-tools"
import type { ChatInfo, MultipeQuestionDto } from "@/views/Home/dto"
import i18n from "@/lang";

import { getSiderStoreData } from "@/views/Sider/store"
import { getChatContentStoreData } from "@/views/ChatContent/store"
import { getKnowledgeStoreData } from "@/views/KnowleadgeStore/store"
import { getAgentStoreData } from "@/views/Agent/store"
import { getChatToolsStoreData } from "../store"
import { getHeaderStoreData } from "@/views/Header/store"
import { getSoftSettingsStoreData } from "@/views/SoftSettings/store"
import { getThirdPartyApiStoreData } from "@/views/ThirdPartyApi/store"

const $t = i18n.global.t


/**
 * @description 发送对话
 */
type ChatParams = {
    user_content: string
    doc_files?: string
    images?: string
    regenerate_id?: string
}
export async function sendChat(params: ChatParams) {
    const { currentModel, } = getHeaderStoreData()
    const { currentContextId, } = getSiderStoreData()
    const { targetNet, } = getSoftSettingsStoreData()
    const { currentTalkingChatId, isInChat, chatHistory, } = getChatContentStoreData()
    const { activeKnowledgeForChat, } = getKnowledgeStoreData()
    const { netActive, temp_chat, mcpListChoosed } = getChatToolsStoreData()
    const { currentSupplierName } = getThirdPartyApiStoreData()


    let model, parameters;
    if (currentSupplierName.value == "ollama") {
        [model, parameters] = currentModel.value.split(":")
    } else {
        model = currentModel.value
        parameters = ""
    }
    // 如果当前对话不存在则创建对话
    try {
        if (!currentContextId.value) {
            await create_chat()
        }
        currentTalkingChatId.value = currentContextId.value
        // 找到当前对话的记录
        let currentChat: null | MultipeQuestionDto = null;
        for (let [key] of chatHistory.value) {
            if (key.content == params.user_content) {
                currentChat = key
            }
        }

        await axios.post("http://127.0.0.1:7071/chat/chat", {
            model,
            parameters,
            context_id: currentContextId.value,
            search: netActive.value ? targetNet.value : "",
            rag_list: JSON.stringify(activeKnowledgeForChat.value),
            supplierName: currentSupplierName.value,
            temp_chat: String(temp_chat.value),
            mcp_servers: mcpListChoosed.value,
            ...params
        }, {
            responseType: 'text',
            onDownloadProgress: (progressEvent: any) => {
                // 获取当前接收到的部分响应数据
                const currentResponse = progressEvent.event.currentTarget.responseText;
                // 防止切换带来的错误
                if (currentTalkingChatId.value == currentContextId.value) chatHistory.value.set(currentChat!, { content: currentResponse, stat: { model: currentModel.value }, id: "" })
            }
        })
        /***** 请求结束行为可以在此执行 *****/
        const lastChhat = await post("/chat/get_last_chat_history", { context_id: currentContextId.value })
        // 获取最后提条对话信息并拼接到对话历史中
        if (chatHistory.value.get(currentChat!)) {
            // chatHistory.value.get(params.user_content)!.stat = lastChhat.message.eval_count
            Object.assign(chatHistory.value.get(currentChat!)!.stat as Object, lastChhat.message.stat)
            chatHistory.value.get(currentChat!)!.search_result = lastChhat.message.search_result as Array<any>
            chatHistory.value.get(currentChat!)!.id = lastChhat.message.id
        }
        // 渲染mermaid
        eventBUS.$emit("answerRendered")
        isInChat.value = false
    } catch (error) {
        sendLog(error as Error)
    }
}



/**
 * @description 终止对话生成
 */
export async function stopGenerate() {
    const { currentContextId } = getSiderStoreData()
    const { isInChat } = getChatContentStoreData()
    try {
        const res = await post("/chat/stop_generate", { context_id: currentContextId.value })
        if (res.code == 200) {
            message.success($t("对话已停止"))
        }
        isInChat.value = false
        await post("/chat/get_last_chat_history", { context_id: currentContextId.value })
        await getChatInfo(currentContextId.value)
    } catch (error) {
        sendLog(error as Error)
    }
}

/**
 * @description 文件上传限制
 */
export const fileLimit = [
    "docx",
    "doc",
    "xlsx",
    "xls",
    "csv",
    "pptx",
    "ppt",
    "pdf",
    "html",
    "htm",
    "md",
    "markdown",
    "txt",
    "log",
]

export const imageLimit = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
]

export const acceptFileType = [...fileLimit, ...imageLimit].reduce((p, v) => {
    return p + `.${v},`
}, "")

/**
 * @description 选择文件
 */
export function chooseQuestionFiles() {
    const { questionFilesRef } = getChatToolsStoreData()
    questionFilesRef.value.click()
}

/**
 * @description 上传附件：文件选择回调
 */
export function filesChange() {
    const { questionFilesRef, questionFileList, questionImageList, questionImages, questionFiles, questionFilesCache } = getChatToolsStoreData()
    const sizeCheck = checkFileSize(questionFilesRef.value.files[0])
    if (!sizeCheck) return
    const ext = questionFilesRef.value.files[0].name.split('.').pop()
    if (fileLimit.includes(ext)) {
        questionFileList.value.push(questionFilesRef.value.files[0].name)
        questionFiles.value.push(questionFilesRef.value.files[0].path)
        questionFilesCache.value.push(questionFilesRef.value.files[0])
    } else if (imageLimit.includes(ext)) {
        questionImageList.value.push(questionFilesRef.value.files[0].name)
        questionImages.value.push(questionFilesRef.value.files[0].path)
        questionFilesCache.value.push(questionFilesRef.value.files[0])
    }
    questionFilesRef.value.value = '';
}

/**
 * @description 删除上传的文件
 */
export function removeFile(index: number) {
    const { questionFileList, questionFiles, questionFilesCache } = getChatToolsStoreData()
    const fileName = questionFileList.value.splice(index, 1)
    questionFiles.value.splice(index, 1)
    removeFileFromeCache(fileName[0])
    console.log(questionFilesCache.value)
}

/**
 * @description 删除上传的图片
 */
export function removeImage(index: number) {
    const { questionImages, questionImageList, questionFilesCache } = getChatToolsStoreData()
    const fileName = questionImageList.value.splice(index, 1)
    questionImages.value.splice(index, 1)
    removeFileFromeCache(fileName[0])
    console.log(questionFilesCache.value)
}


/**
* 
* 文件缓存
* 清除缓存中的指定文件
 */
export function removeFileFromeCache(fileName: string) {
    const { questionFilesCache } = getChatToolsStoreData()
    questionFilesCache.value = questionFilesCache.value.filter(item => item.name !== fileName)
}

/**
 * 
 * 计算文件缓存中所有文件大小总和与20mb的比较
 */
export function checkFileSize(file: File) {
    const { questionFilesCache } = getChatToolsStoreData()
    const totalSize = questionFilesCache.value.reduce((p, v) => {
        return p + v.size
    }, 0)
    if (totalSize + file.size > 20 * 1024 * 1024) {
        message.warning($t("附件总大小不能超过20MB"))
        return false
    }
    return true
}

/**
 * @description 滚动条
 */
export function scrollMove() {
    const { scrollRef, userScrollSelf } = getChatContentStoreData()
    let timer: any = null
    return (delay: number) => {
        if (!timer) {
            timer = setTimeout(() => {
                const scrollWrapper = document.querySelector("#scroll-bar .n-scrollbar-content") as HTMLDivElement
                if (userScrollSelf.value) {
                    clearTimeout(timer)
                    timer = null
                    return
                }
                if (scrollRef.value) {
                    scrollRef.value.scrollTo({
                        top: scrollWrapper.offsetHeight,
                        behavior: "instant"
                    })
                    clearTimeout(timer)
                }
                timer = null
            }, delay)
        }
    }
}


/**
 * @description 发送对话内容到模型
 */
export function sendChatToModel() {
    const { isInChat, userScrollSelf, chatHistory } = getChatContentStoreData()
    const { questionContent, questionFiles, questionImages, questionFileList, questionImageList, questionFilesCache } = getChatToolsStoreData()
    const { currentModel, } = getHeaderStoreData()
    if (!questionContent.value.trim()) return

    if (!currentModel.value) {
        message.warning($t("请选择对应模型"))
        return
    }
    isInChat.value = true
    userScrollSelf.value = false
    // 將聊天加入到对话历史
    const formatQuestionContent = questionContent.value.replace(/\n/g, '<br>')
    // 拼接完整key
    const chatKey = {
        content: formatQuestionContent,
        files: questionFiles.value,
        images: questionImages.value
    }
    chatHistory.value.set(chatKey, { content: "", stat: { model: currentModel.value }, search_result: [] })
    nextTick(() => eventBUS.$emit("chat-tool-do-scroll"))
    sendChat({
        user_content: formatQuestionContent,
        images: questionImages.value.join(","),
        doc_files: questionFiles.value.join(",")
    })
    questionContent.value = ""
    questionFiles.value = []
    questionImages.value = []
    questionFileList.value = []
    questionImageList.value = []
    questionFilesCache.value = []
}

/**
 * @description 键盘发送
 */
export function sendChartToModelForKeyBoard(event: KeyboardEvent) {
    const { isInChat } = getChatContentStoreData()
    if (isInChat.value) return
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (event.keyCode == 13) {
            sendChatToModel()
        }
    }
}

/**
 * @description 是否启用联网搜索
 */
export function useSearchEngine() {
    const { netActive, } = getChatToolsStoreData()
    netActive.value = !netActive.value
}


/**
 * @description 打开临时对话
 */
export function useTempChat() {
    const { temp_chat, } = getChatToolsStoreData()
    temp_chat.value = !temp_chat.value
}


/**
 * @description 获取已安装的MCP列表
 */
export async function getMcpServerListForChat() {
    const { mcpListForChat } = getChatToolsStoreData()
    try {
        const res = await post('/mcp/get_mcp_server_list');
        mcpListForChat.value = res.message
    } catch (error) {
        sendLog(error as Error)
    }
}

/**
 * @description 在对话工具时，选择mcp进行对话
 */
export function chooseMcpServerForChat(mcpName: string) {
    const { mcpListChoosed } = getChatToolsStoreData()
    if (mcpListChoosed.value.includes(mcpName)) {
        mcpListChoosed.value = mcpListChoosed.value.filter(item => item !== mcpName)
    } else {
        mcpListChoosed.value.push(mcpName)
    }
}

