import { post } from "@/api";
import { storeToRefs } from "pinia";
import useIndexStore, { type ChatInfo } from "../store";
import { message } from "@/utils/naive-tools"
import axios from "axios";
import { eventBUS } from "../utils/tools";
import { nextTick } from "vue";
import i18n from "@/lang";
const $t = i18n.global.t
/**
 * @description 获取store内容
 */
function getIndexStore() {
    const indexStore = useIndexStore()
    return storeToRefs(indexStore)
}

/**
 * @descript 获取已安装模型列表
 */
export async function get_model_list() {
    const { currentModel } = getIndexStore()
    const res = await post("/chat/get_model_list")
    const optionRes = res.message.reduce((p: any, v: any) => {
        return [...p, {
            label: v.model,
            value: v.model,
        }]
    }, [])
    const { modelList } = getIndexStore()
    modelList.value = optionRes
    if (!currentModel.value && res.message.length) currentModel.value = res.message[0].model
}

/**
 * @description 判断某个模型是否已安装
 */
export function isInstalled(model: string) {
    let flag = false
    const { modelList } = getIndexStore()
    modelList.value.forEach((item: any) => {
        if (item.label == model) flag = true
    })
    return flag
}


/**
 * @description 获取对话列表
 */
export async function get_chat_list() {
    const { chatList, currentContextId, currentChatTitle, chatHistory, currentModel, contextIdForDel } = getIndexStore()
    const res = await post("/chat/get_chat_list")
    chatList.value = res.message
    if (chatList.value.length) {
        if (currentContextId.value == contextIdForDel.value) {
            currentContextId.value = chatList.value[0].context_id
            currentChatTitle.value = chatList.value[0].title
            currentModel.value = chatList.value[0].model + ":" + chatList.value[0].parameters
            getChatInfo(currentContextId.value)
        }
    }
}

/**
 * @description 创建新对话
 */
export async function create_chat(title: string) {
    const { currentModel, currentContextId, questionContent } = getIndexStore()
    const [model, parameters] = currentModel.value.split(":")
    const res = await post('/chat/create_chat', { model, parameters, title: questionContent.value })
    currentContextId.value = res.message.context_id
    get_chat_list()
}


/**
 * @description 获取对话信息
 */
export async function getChatInfo(context_id: string) {
    const { chatHistory } = getIndexStore()
    const res = await post("/chat/get_chat_info", { context_id })
    if (res.code == 200) {
        chatHistory.value = generateObject(res.message)
    }
    // 渲染对话历史后立即滑动到底部
    nextTick(() => eventBUS.$emit("doScroll"))
}

/**
 * @description 发送对话
 */
type ChatParams = {
    user_content: string
    images?: string[]
    regenerate_id?: string
}
export async function sendChat(params: ChatParams) {
    const { currentModel, currentContextId, chatHistory, currentTalkingChatId, isInChat, targetNet } = getIndexStore()
    const [model, parameters] = currentModel.value.split(":")

    // 如果当前对话不存在则创建对话
    if (!currentContextId.value) {
        await create_chat(params.user_content)
    }
    currentTalkingChatId.value = currentContextId.value

    await axios.post("http://127.0.0.1:7071/chat/chat", {
        model,
        parameters,
        context_id: currentContextId.value,
        search: targetNet.value,
        ...params
    }, {
        responseType: 'text',
        onDownloadProgress: (progressEvent: any) => {
            // 获取当前接收到的部分响应数据
            const currentResponse = progressEvent.event.currentTarget.responseText;
            // 防止切换带来的错误
            if (currentTalkingChatId.value == currentContextId.value) chatHistory.value.set(params.user_content, { content: currentResponse, stat: { model: currentModel.value }, id: "" })
        }
    })

    // 请求结束行为可以在此执行
    const lastChhat = await post("/chat/get_last_chat_history", { context_id: currentContextId.value })
    if (chatHistory.value.get(params.user_content)) {
        // chatHistory.value.get(params.user_content)!.stat = lastChhat.message.eval_count
        Object.assign(chatHistory.value.get(params.user_content)!.stat as Object, lastChhat.message.stat)
        chatHistory.value.get(params.user_content)!.search_result = lastChhat.message.search_result as Array<any>
        chatHistory.value.get(params.user_content)!.id = lastChhat.message.id
    }
    isInChat.value = false
}

/**
 * @description 终止对话生成
 */
export async function stopGenerate() {
    const { currentContextId, isInChat } = getIndexStore()
    const res = await post("/chat/stop_generate", { context_id: currentContextId.value })
    if (res.code == 200) {
        message.success($t("对话已停止"))
    }
    isInChat.value = false
    await post("/chat/get_last_chat_history", { context_id: currentContextId.value })
    await getChatInfo(currentContextId.value)
}


/**
 * @description 删除对话
 */
export async function removeChat(context_id: string) {
    const { chatRemoveConfirm } = getIndexStore()
    const res = await post("/chat/remove_chat", { context_id })
    if (res.code == 200) {
        message.success($t("对话删除成功"))
        get_chat_list()
        chatRemoveConfirm.value = false
    } else {
        message.error(`${$t("对话删除失败：")}${res.error_msg}`)
    }

}

/**
 * @description 修改指定对话标题
 */
export async function modifyChatTitle(params: { context_id: string, title: string }) {
    const { chatModifyConfirm } = getIndexStore()
    const res = await post("/chat/modify_chat_title", params)
    if (res.code == 200) {
        message.success($t("对话标题修改成功"))
        get_chat_list()
        chatModifyConfirm.value = false
    } else {
        message.error(`${$t("对话标题修改失败:")}${res.error_msg}`)
    }
}

/**
 * @description 获取机器配置信息
 */
export async function getConfigurationInfo() {
    const { pcInfo } = getIndexStore()
    const res = await post("/manager/get_configuration_info")
    pcInfo.value = res.message
}

/**
 * @description 获取可安装模型列表
 */
export async function getVisibleModelList() {
    const { visibleModelList, settingsShow, managerInstallConfirm, isInstalledManager, isResetModelList } = getIndexStore();
    const res = await post("/manager/get_model_manager")
    if (res.code == 200) {
        isInstalledManager.value = res.message.status
        // 如果status为false说明本地没有模型管理器，要求对方安装
        if (res.message.status == false) {
            settingsShow.value = true
            managerInstallConfirm.value = true
        }
        isInstalledManager.value = true
        visibleModelList.value = res.message.models
        if (isResetModelList.value.type == 1) {
            isResetModelList.value.status = true
        }
    }
}

/**
 * @description 获取本机盘符信息
 */
export async function getDiskList() {
    const res = await post("/manager/get_disk_list")
}

/**
 * @description 安裝大模型
 */
export async function installModel() {
    const { modelNameForInstall, installShow } = getIndexStore()
    // 执行安装
    post("/manager/install_model", modelNameForInstall.value)
    installShow.value = true
    // 获取安装进度
    getModelInstallProgress()
}

/**
 * @description 获取大模型安装进度
 */
export async function getModelInstallProgress() {
    const { modelInstallProgress, installShow, modelNameForInstall, downloadText, settingsShow } = getIndexStore();
    let timer = setInterval(async () => {
        const res = await post("/manager/get_model_install_progress", modelNameForInstall.value)
        if (res.message.status == 3) {
            message.success($t("安装成功"))
            installShow.value = false
            downloadText.value = $t("正在连接，请稍候...")
            settingsShow.value = false
            clearInterval(timer)
            get_model_list()
            getVisibleModelList()
        }
        const modelNameFull = modelNameForInstall.value.model + ":" + modelNameForInstall.value.parameters
        if (res.message.status == 0) {
            // 等待下载
            downloadText.value = $t("等待下载:{0}，请稍候...", [modelNameFull])
        }

        if (res.message.status == 1) {
            // 正在下载
            downloadText.value = $t("正在下载:{0}，请稍候...", [modelNameFull])
        }

        if (res.message.status == 2) {
            // 正在安装
            downloadText.value = $t("正在安装:{0}，请稍候...", [modelNameFull])
        }

        if (res.message.status == -1) {
            message.error($t("安装失败"))
            installShow.value = false
            clearInterval(timer)
        }

        modelInstallProgress.value = res.message
    }, 1000)
}

/**
 * @description 删除模型
 */
export async function removeModel() {
    const { modelForDel, modelDelLoading, modelDelConfirm } = getIndexStore()
    const [model, parameters] = modelForDel.value.split(":")
    const res = await post("/manager/remove_model", { model, parameters })
    if (res.code == 200) {
        message.success($t("模型删除成功"))
        get_model_list()
    } else {
        message.error($t("模型删除失败:{0}", [res.error_msg]))
    }
    modelDelLoading.value = false
    modelDelConfirm.value = false
}

// 拼接对话记录
function generateObject(arr: any) {
    const result: ChatInfo = new Map();
    for (let i = 0; i < arr.length; i += 2) {
        const key = arr[i].content;
        let value = arr[i + 1] ? (arr[i + 1].reasoning + arr[i + 1].content) : $t("模型异常，请重新生成");
        result.set(`${i}--${key}`, {
            content: value,
            stat: arr[i + 1].stat,
            search_result: arr[i + 1].search_result,
            id: arr[i + 1].id
        });
    }
    return result;
}

/**
 * @description 安装模型管理器
 */
export async function installModelManager() {
    const { managerForInstall, modelManagerInstallProgresShow, managerInstallConfirm, modelManagerInstallNotice } = getIndexStore()
    modelManagerInstallProgresShow.value = true
    managerInstallConfirm.value = false
    post("/manager/install_model_manager", { manager_name: managerForInstall.value })
    modelManagerInstallNotice.value = $t("正在下载")
    getModelManagerInstallProgress()
}

/**
 * @description 获取模型管理器安装进度
 */
export async function getModelManagerInstallProgress() {
    const { managerForInstall, modelManagerInstallProgresShow, modelManagerInstallProgress, isInstalledManager, isResetModelList, modelManagerInstallNotice } = getIndexStore();
    let timer = setInterval(async () => {
        const res = await post("/manager/get_model_manager_install_progress", { manager_name: managerForInstall.value })
        if (res.message.status == 0) modelManagerInstallNotice.value = $t("正在选择下载节点，请稍后")
        if (res.message.status == 1) modelManagerInstallNotice.value = $t("正在下载模型管理器，请稍后")
        if (res.message.status == 2) modelManagerInstallNotice.value = $t("正在安装模型管理器，可能要几分钟时间，请耐心等待")
        if (res.message.status == 3) {
            modelManagerInstallNotice.value = $t("安装成功")
            message.success($t("模型管理器安装成功"))
            modelManagerInstallProgresShow.value = false
            isInstalledManager.value = true
            clearInterval(timer)
            getVisibleModelList()
            isResetModelList.value.type = 1
        }

        if (res.message.status == -1) {
            message.error($t("模型管理器安装失败"))
            clearInterval(timer)
        }

        modelManagerInstallProgress.value = res.message
    }, 1000)

}
/**
 * @description 重新选择下载节点
 */
export async function reconnect_model_download() {
    const res: any = await post('/manager/reconnect_model_download', {});
    message.success(res.msg)
}

/**
 * @description 获取当前语言和支持的语言列表
 */
export async function get_languages() {
    const { languageOptions, currentLanguage } = getIndexStore()
    const res = await post("/index/get_languages")
    languageOptions.value = res.message.languages.reduce((p: any, v: any) => {
        return [...p, { label: v.title, value: v.name }]
    }, [])
}

/**
 * @description 设置当前语言
 */
export async function setServiceLanguage(language: string) {
    await post("/index/set_language", { language })
}

/**
 * @description 获取分享列表
 */
export async function getShareList() {
    const { shareHistory } = getIndexStore()
    const res = await post("/share/get_share_list")
    shareHistory.value = res.message
}

/**
 * @description 创建分享
 */
export async function createShare(title: string, modelName: string) {
    const [model, parameters] = modelName.split(":")
    await post("/share/create_share", {
        model,
        parameters,
        title: title,
    })
    getShareList()
    message.success($t("创建分享成功"))
}


/**
 * @description 修改分享
 */
export async function modifyShare(share_id: string, modelName: string, title: string) {
    const { modifyShareShow } = getIndexStore()
    const [model, parameters] = modelName.split(":")
    await post("/share/modify_share", {
        share_id,
        model,
        parameters,
        title
    })
    await getShareList()
    message.success($t("修改成功"))
    modifyShareShow.value = false
}

/**
 * @description 删除分享
 */
export async function delShare(share_id: string) {
    const { delShareConfirmShow } = getIndexStore()
    await post("/share/remove_share", { share_id })
    await getShareList()
    message.success("删除分享成功")
    delShareConfirmShow.value = false
}