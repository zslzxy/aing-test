import { get, post } from "@/api";
import { storeToRefs } from "pinia";
import useIndexStore, { type ChatInfo, type ActiveKnowledgeDto, type ActiveKnowledgeDocDto, type KnowledgeDocumentInfo } from "../store";
import { message, useDialog, modal } from "@/utils/naive-tools"
import OtherModel from "../components/OtherModel.vue";
import SoftSettings from "../components/SoftSettings.vue";
import CreateKnowledgeStore from "../components/CreateKnowledgeStore.vue";
import UploadKnowledgeDoc from "../components/UploadKnowledgeDoc.vue";
import axios from "axios";
import { eventBUS } from "../utils/tools";
import { nextTick, ref } from "vue";
import { NButton, NSpin } from "naive-ui"
import i18n from "@/lang";
// 模拟请求
import { testRequest } from "@/utils/tools"
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
    const { chatList, currentContextId, currentChatTitle, chatHistory, currentModel, contextIdForDel, netActive, activeKnowledgeForChat } = getIndexStore()
    const res = await post("/chat/get_chat_list")
    chatList.value = res.message
    if (chatList.value.length) {
        if (currentContextId.value == contextIdForDel.value) {
            currentContextId.value = chatList.value[0].context_id
            currentChatTitle.value = chatList.value[0].title
            currentModel.value = chatList.value[0].model + ":" + chatList.value[0].parameters
            chatList.value[0].search_type ? netActive.value = true : netActive.value = false
            activeKnowledgeForChat.value = chatList.value[0].rag_list ? chatList.value[0].rag_list : []
            getChatInfo(currentContextId.value)
        }
    }
}

/**
 * @description 创建新对话：打开新对话窗口
 */
export function createNewComu() {
    const { currentContextId, currentChatTitle, chatHistory, activeKnowledgeForChat, netActive, activeKnowledge, activeKnowledgeDto } = getIndexStore()
    // if (currentContextId.value == "") return
    // chatList.value.push({
    //     contextPath: "",
    //     context_id: "",
    //     model: "",
    //     parameters: "",
    //     title: "新对话"
    // })
    currentContextId.value = ""
    currentChatTitle.value = $t("新对话")
    chatHistory.value = new Map()
    activeKnowledgeForChat.value = []
    netActive.value = false
    activeKnowledge.value = ""
    activeKnowledgeDto.value = null
    knowledgeIsClose()
}

/**
 * @description 创建新对话：发起请求
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
    const { currentModel, currentContextId, chatHistory, currentTalkingChatId, isInChat, targetNet, activeKnowledgeForChat, netActive } = getIndexStore()
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
        search: netActive.value ? targetNet.value : "",
        rag_list: JSON.stringify(activeKnowledgeForChat.value),
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
export async function installModel(modelName?: string, callback?: () => void) {
    const { modelNameForInstall, installShow } = getIndexStore()
    let res = null
    if (modelName) {
        const modelSplit = modelName.split(":")
        modelNameForInstall.value = { model: modelSplit[0], parameters: modelSplit[1] }
    }
    // 执行安装
    res = post("/manager/install_model", modelNameForInstall.value)
    installShow.value = true
    // 获取安装进度
    getModelInstallProgress(callback)


}

/**
 * @description 获取大模型安装进度
 */
export async function getModelInstallProgress(callback?: () => void) {
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
            callback && callback()
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

// 知识库展开状态
function knowledgeIsOpen() {
    const { knowledgeSiderWidth } = getIndexStore()
    knowledgeSiderWidth.value = 240
}

// 知识库关闭状态
export function knowledgeIsClose() {
    const { knowledgeSiderWidth } = getIndexStore()
    knowledgeSiderWidth.value = 0
}

/**
 * @description 打开知识库侧边栏界面
 */
export async function openKnowledgeStore(ragDto: ActiveKnowledgeDto) {
    const { knowledgeSiderWidth, activeKnowledge, activeKnowledgeDto, activeKnowledgeForChat } = getIndexStore()
    handleSwitchKnowledge(ragDto)
    activeKnowledgeDto.value = ragDto
    activeKnowledge.value = ragDto.ragName
    activeKnowledgeForChat.value = [ragDto.ragName]
    await getRagDocList(activeKnowledge.value as string)
    if (knowledgeSiderWidth.value == 0) {
        knowledgeIsOpen()
    }
    singleActive("knowledge", ragDto.ragName)
}

/**
 * @description 获取知识库状态
 */
export async function ragStatus() {
    const { isInstalledBge } = getIndexStore()
    const { code } = await post("/rag/rag_status")
    if (code !== 200) {
        isInstalledBge.value = false
    } else {
        isInstalledBge.value = true
    }
}

/**
 * @description 提示安装bge,安装完成后继续创建新的知识库
 */
export function installBge() {
    const { settingsShow, isInstalledBge } = getIndexStore()
    const dialog = useDialog({
        title: "提示",
        content: () => {
            return <div class="flex items-center justify-center">
                <div class="box-border p-5 flex justify-center items-center gap-1.25 mt-20">
                    <i class="i-jam:alert-f w-24 h-24 text-[#E6A23C]"></i><span>请先安装bge-m3:latest</span>
                </div>
            </div>
        },
        action: () => {
            return <div class="flex items-center justify-center gap-5">
                <NButton type="default" onClick={() => dialog.destroy()}>暂不安装</NButton>
                <NButton type="primary" onClick={async () => {
                    dialog.destroy()
                    await installModel("bge-m3:latest", () => {
                        isInstalledBge.value = true
                        createNewKnowledgeStore()
                    })

                }}>立即安装</NButton>
            </div>
        },
        style: {
            width: "480px",
        }
    })
}


/**
 * @description 新建知识库：接口请求
 */
export async function createRag() {
    const { createKnowledgeFormData, activeKnowledge } = getIndexStore()
    const res = await post("/rag/create_rag", createKnowledgeFormData.value)
    if (res.code == 200) {
        activeKnowledge.value = createKnowledgeFormData.value.ragName;
        message.success($t("知识库创建成功"))
    } else {
        message.error($t("知识库创建失败"))
    }
}

/**
 * @description 获取知识库列表
 */
const initTime = ref(0)
export async function getRagList() {
    const { knowledgeList, activeKnowledge, activeKnowledgeDto } = getIndexStore()
    try {
        const res = await post("/rag/get_rag_list");
        knowledgeList.value = res.message
        if (knowledgeList.value.length && activeKnowledge.value == null && initTime.value != 0) {
            activeKnowledge.value = knowledgeList.value[0].ragName
            activeKnowledgeDto.value = knowledgeList.value[0]
        } else {
            initTime.value++
        }
    } catch (error) {
        message.error($t("获取知识库列表失败，请重试"))
    }
}

/**
 * @description 知识库切换状态
 */
export function handleSwitchKnowledge(rag: KnowledgeDocumentInfo) {
    const { activeKnowledge, docContent } = getIndexStore()

    if (rag.ragName != activeKnowledge.value) {
        docContent.value = ""
    }
}

/**
 * @description 获取知识库文档列表
 */
export async function getRagDocList(ragName: string) {
    const { activeKnowledgeDocList } = getIndexStore()
    const res = await post("/rag/get_rag_doc_list", { ragName })
    activeKnowledgeDocList.value = res.message
}

/**
 * @description 获取指定文档内容
 */
export async function getDocContent(doc: ActiveKnowledgeDocDto) {
    const { docContent } = getIndexStore()
    const res = await get("/rag/get_doc_content", { ragName: doc.doc_rag, docName: doc.doc_name })
    docContent.value = res.message
}

/**
 * @description 文档列表轮询
 */
function ragDocLoop() {
    const { activeKnowledge, activeKnowledgeDocList, docParseStatus } = getIndexStore()
    let timer: any = null
    docParseStatus.value = true
    timer = setInterval(async () => {
        await getRagDocList(activeKnowledge.value as string)
        const parsedStstus = activeKnowledgeDocList.value.every(item => {
            return item.is_parsed == 1
        })
        if (parsedStstus) {
            clearInterval(timer)
            docParseStatus.value = false
        }
    }, 5000)
}

/**
 * @description 删除知识库询问
 */
export function removeRagConfirm(ragName: string) {
    const dialog = useDialog({
        title: "提示",
        content: () => {
            return <div class="flex items-center justify-center">
                <div class="box-border p-5 flex justify-center items-center gap-1.25 mt-20">
                    <i class="i-jam:alert-f w-24 h-24 text-[#E6A23C]"></i><span >{$t("是否确认删除知识库{0}及其下的所有文档？该操作不可逆", [ragName])}</span>
                </div>
            </div>
        },
        style: {
            width: "500px",
        },
        onOk: async () => {
            await removeRag(ragName);
            dialog.destroy()
        },
        onCancel: () => {
            dialog.destroy()
        }
    })
}

/***
 * @description 删除知识库
 */
export async function removeRag(ragName: string) {
    const { knowledgeList, activeKnowledge, activeKnowledgeDto } = getIndexStore()
    try {
        await post("/rag/remove_rag", { ragName })
        await getRagList()
        if (knowledgeList.value.length) {
            activeKnowledge.value = knowledgeList.value[0].ragName
            activeKnowledgeDto.value = knowledgeList.value[0]
            await getRagDocList(activeKnowledge.value as string)
        }
        message.success($t("删除知识库成功"))
    } catch (error) {
        message.error($t("删除知识库失败，请重试"))
    }
}

/**
 * @description 修改知识库
 */
export async function modifyRag() {
    const { createKnowledgeFormData } = getIndexStore()
    const dialog = useDialog({
        title: "修改知识库",
        content: () => <CreateKnowledgeStore disabledKey="ragName" />,
        style: {
            width: "480px",
        },
        onOk: async () => {
            try {
                await post("/rag/modify_rag", createKnowledgeFormData.value)
                await getRagList()
                message.success($t("修改知识库成功"))
                dialog.destroy()
            } catch (error) {
                message.error($t("修改知识库失败，请重试"))
            }
        },
        onCancel: () => {
            dialog.destroy()
        }
    })
}

/**
 * @description 新建知识库：点击按钮后续交互逻辑
 */
export function createNewKnowledgeStore() {
    const { createKnowledgeModelRef, createKnowledgeFormData, createKnowledgeDialogIns, knowledgeList, activeKnowledge, isInstalledBge, settingsShow, } = getIndexStore()
    if (!isInstalledBge.value) {
        installBge()
        return
    }
    // 重置表单
    function resetForm() {
        createKnowledgeModelRef.value.restoreValidation()
        createKnowledgeFormData.value = { ragName: "", ragDesc: "" }
        createKnowledgeDialogIns.value!.destroy()
    }
    createKnowledgeDialogIns.value = useDialog({
        title: "新建知识库",
        content: () => <CreateKnowledgeStore />,
        style: {
            width: "480px"
        },
        loading: true,
        onCancel() {
            resetForm()
        },
        onOk: async () => {
            const validRes = await createKnowledgeModelRef.value.validate();
            if (!validRes) return
            // 创建知识库
            try {
                await createRag()
                resetForm()
                knowledgeIsOpen()
                await getRagList()
                await getRagDocList(activeKnowledge.value as string)
            } catch (error) {
                console.warn(error)
            }



            /*  knowledgeList.value.push({
                 ragName: 2,
                 ragName: "这是一份新的知识库",
                 test_createtime: "2025-03-06",
                 test_desc: "这是一份新的知识库，主要用于测试工作，在正式开发接口出具以后，我将替换这些测试数据",
                 test_size: "200KB",
                 test_docs: [
                     {
                         doc_name: "我的第一个知识库.docx",
                         doc_abstract: "这是我的第一份知识库文档，我将使用这份文档来进行一系列的开发和提效工作，但在正式开发接口发布后，这份虚拟数据将被我删除，请不要使用这份数据",
                         update_time: "2023-03-06"
                     }
                 ]
             })
             
             activeKnowledge.value = {
                 ragName: 2,
                 ragName: "这是一份新的知识库",
                 test_createtime: "2025-03-06",
                 test_desc: "这是一份新的知识库，主要用于测试工作，在正式开发接口出具以后，我将替换这些测试数据",
                 test_size: "200KB",
                 test_docs: [
                     {
                         doc_name: "我的第一个知识库.docx",
                         doc_abstract: "这是我的第一份知识库文档，我将使用这份文档来进行一系列的开发和提效工作，但在正式开发接口发布后，这份虚拟数据将被我删除，请不要使用这份数据",
                         update_time: "2023-03-06"
                     }
                 ]
             } */
        },
    })

}

/**
 * @description 上传知识库文档:打开弹窗
 */
export async function openDocUploadDialog() {
    const { fileOrDirList, chooseList, isUploadingDoc } = getIndexStore()
    async function doOk() {
        try {
            isUploadingDoc.value = true
            await uploadRagDocForManual()
            isUploadingDoc.value = false
            fileOrDirList.value = []
            chooseList.value = []
            dialog.destroy()
            ragDocLoop()
        } catch (error) {
            console.warn(error)
            isUploadingDoc.value = false
        }
    }
    async function doCancel() {
        fileOrDirList.value = []
        chooseList.value = []
        isUploadingDoc.value = false
        dialog.destroy()
    }
    const dialog = useDialog({
        title: "上传知识库文档",
        content: () => <NSpin show={isUploadingDoc.value}>
            {{
                default: () => <UploadKnowledgeDoc />,
                description: () => <span>{$t("正在解析文档，这可能要几分钟时间...")}</span>
            }}
        </NSpin>,
        style: {
            width: "580px"
        },
        action: () => {
            return <div class="flex justify-end items-center gap-5">
                <NButton onClick={doCancel} disabled={isUploadingDoc.value ? true : false}>{$t("取消")}</NButton>
                <NButton type="primary" onClick={doOk} disabled={isUploadingDoc.value || fileOrDirList.value.length == 0 ? true : false}>{$t("确认")}</NButton>
            </div>
        },

    })
}

/**
 * @description 上传知识库文档：手动上传
 */
export async function uploadRagDocForManual() {
    const { fileOrDirList, activeKnowledge } = getIndexStore()
    const { code, msg } = await post("/rag/upload_doc", {
        ragName: activeKnowledge.value,
        filePath: JSON.stringify(fileOrDirList.value)
    })
    if (code == 200) {
        message.success(msg as string)
        // TODO:此处暂时需要做500ms的定时器，等待后端解析文件
        setTimeout(async () => {
            await getRagDocList(activeKnowledge.value as string)
        }, 500)
        return true
    } else {
        message.error(msg as string)
        throw new Error(msg)
    }
}

/**
 * @description 删除知识库文档：弹窗
 */
export function delKnowledgeDoc(doc: any) {
    const { activeKnowledge } = getIndexStore()
    const dialog = useDialog({
        title: "提示",
        content: () => {
            return <div class="flex items-center justify-center">
                <div class="box-border p-5 flex justify-center items-center gap-1.25 mt-20">
                    <i class="i-jam:alert-f w-24 h-24 text-[#E6A23C]"></i><span>{$t("是否确认删除文档{0}？该操作不可逆", [doc.doc_name])}</span>
                </div>
            </div>
        },
        style: {
            width: "480px",
        },

        onOk: async () => {
            await removeDoc(doc)
            message.success($t("文档删除成功"))
            await getRagDocList(activeKnowledge.value as string)
            dialog.destroy()
        },
        onCancel() {
            dialog.destroy()
        }
    })
}

/**
 * @description 删除知识库文档：接口请求
 */
export async function removeDoc(doc: any) {
    const { activeKnowledge } = getIndexStore()
    await get("/rag/remove_doc", { ragName: activeKnowledge.value, docIdList: JSON.stringify([doc.doc_id]) })
}


/**
 * @description 打开软件设置弹窗
 */
export function openSoftSettings() {
    const dialog = useDialog({
        title: "软件设置",
        content: () => <SoftSettings />,
        style: {
            width: "480px"
        },
        action: () => {
            return <div>
                <NButton onClick={() => dialog.destroy()}>确认</NButton>
            </div>
        }
    })
    return dialog
}

/**
 * @description 打开第三方模型api弹窗
 */
export function openThirdPartyModelApi() {
    // icon:()=><i class="i-tdesign:close-circle w-24 h-24 cursor-pointer text-[#909399]"></i>,

    const dialog = useDialog({
        title: "第三方模型API",
        content: () => <OtherModel />
    })
}

/**
 * @description currentChat和currentKnowledge只能存在一个
 */
export function singleActive(type: "chat" | "knowledge", sign: any) {
    const { currentContextId, activeKnowledge } = getIndexStore()



    if (type == "chat") {
        activeKnowledge.value = ""
        currentContextId.value = sign
        knowledgeIsClose()
    } else {
        currentContextId.value = ""
        activeKnowledge.value = sign
    }
}
