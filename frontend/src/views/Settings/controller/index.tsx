import { nextTick, ref } from "vue"
import { post } from "@/api"
import { eventBUS } from "@/views/Home/utils/tools"
import { sendLog } from "@/views/Home/controller"
import { message, useDialog } from "@/utils/naive-tools"
import type { AgentItemDto } from "@/views/Home/dto"
import { NButton, type DataTableColumns } from "naive-ui"
import i18n from "@/lang";

import { knowledgeIsClose } from "@/views/KnowleadgeStore/controller"
import { getSettingsStoreData } from "../store"
import { getHeaderStoreData } from "@/views/Header/store"
import { getThirdPartyApiStoreData } from "@/views/ThirdPartyApi/store"
import { getKnowledgeStoreData } from "@/views/KnowleadgeStore/store"

const $t = i18n.global.t


/**
 * @description 打开模型管理
 */
export async function openModelManage() {
    const { settingsShow } = getSettingsStoreData()
    try {
        await getVisibleModelList()
        settingsShow.value = true
    } catch (error) {
        sendLog(error as Error)
    }
}


/**
 * @description 获取机器配置信息
 */
export async function getConfigurationInfo() {
    const { pcInfo } = getSettingsStoreData()
    try {
        const res = await post("/manager/get_configuration_info")
        pcInfo.value = res.message
    } catch (error) {
        sendLog(error as Error)
    }
}

/**
 * @description 获取可安装模型列表
 */
export async function getVisibleModelList() {
    const { visibleModelList, settingsShow, managerInstallConfirm, isInstalledManager, isResetModelList, ollamaUrl } = getSettingsStoreData();
    try {
        const res = await post("/manager/get_model_manager")
        if (res.code == 200) {
            isInstalledManager.value = res.message.status
            ollamaUrl.value = res.message.ollama_host
            // 如果status为false说明本地没有模型管理器，要求对方安装
            if (res.message.status == false) {
                settingsShow.value = true
                managerInstallConfirm.value = true
            } else {
                managerInstallConfirm.value = false
            }
            // isInstalledManager.value = true
            visibleModelList.value = res.message.models
            if (isResetModelList.value.type == 1) {
                isResetModelList.value.status = true
            }
        }
    } catch (error) {
        sendLog(error as Error)
    }
}


/**
 * @descript 获取已安装模型列表
 */
export async function get_model_list() {
    try {
        const { modelList, modelListSource, } = getHeaderStoreData()
        const { currentSupplierName } = getThirdPartyApiStoreData()
        const res = await post("/chat/get_model_list")
        modelListSource.value = res.message
        modelList.value = Object.values(res.message).reduce((p: any, v: any) => {
            return [...p, ...v.reduce((_p: any, _v: any) => {
                return [..._p, {
                    label: _v.title,
                    value: _v.model,
                    ..._v,
                }]
            }, [])]
        }, [])
        if (modelList.value.length && currentSupplierName.value == "") {
            currentSupplierName.value = modelList.value[0].supplierName
        }
    } catch (error) {
        console.log(error)
        sendLog(error as Error)
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
    const { modelNameForInstall, installShow } = getSettingsStoreData()
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
    const { modelInstallProgress, installShow, modelNameForInstall, downloadText, settingsShow } = getSettingsStoreData();
    let timer = setInterval(async () => {
        const res = await post("/manager/get_model_install_progress", modelNameForInstall.value)
        if (res.message.status == 3) {
            message.success($t("安装成功"))
            installShow.value = false
            downloadText.value = $t("正在连接，请稍候...")
            clearInterval(timer)
            eventBUS.$emit("modelInstalled", "installed")
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
 * @description 安装模型管理器
 */
export async function installModelManager() {
    const {
        managerForInstall,
        modelManagerInstallProgresShow,
        managerInstallConfirm,
        modelManagerInstallNotice,
        modelManagerInstallPath
    } = getSettingsStoreData()

    if (!managerForInstall.value) {
        message.warning($t("请选择模型管理器"))
        return
    }
    if (!modelManagerInstallPath.value) {
        message.warning($t("请选择模型管理器安装路径"))
        return
    }
    if (managerForInstall.value && modelManagerInstallPath.value) {
        modelManagerInstallProgresShow.value = true
        managerInstallConfirm.value = false
        post("/manager/install_model_manager", { manager_name: managerForInstall.value, models_path: modelManagerInstallPath.value })
        modelManagerInstallNotice.value = $t("正在下载")
        getModelManagerInstallProgress()
    }
}



/**
 * @description 获取模型管理器安装进度
 */
export async function getModelManagerInstallProgress() {
    const { managerForInstall, modelManagerInstallProgresShow, modelManagerInstallProgress, isInstalledManager, isResetModelList, modelManagerInstallNotice } = getSettingsStoreData();
    let timer = setInterval(async () => {
        const res = await post("/manager/get_model_manager_install_progress", { manager_name: managerForInstall.value })
        if (res.message.status == 0) modelManagerInstallNotice.value = $t("正在选择下载节点，请稍后")
        if (res.message.status == 1) modelManagerInstallNotice.value = $t("正在下载模型管理器，请稍后")
        if (res.message.status == 2) modelManagerInstallNotice.value = $t("正在安装模型管理器，可能要几分钟时间，请耐心等待")
        if (res.message.status == 3) {
            modelManagerInstallNotice.value = $t("安装成功")
            message.success($t("模型管理器安装成功"))
            eventBUS.$emit("ollamaInstallBge")
            eventBUS.$del("ollamaInstallBge")
            modelManagerInstallProgresShow.value = false
            isInstalledManager.value = true
            clearInterval(timer)
            getVisibleModelList()
            isResetModelList.value.type = 1
        }

        if (res.message.status == -1) {
            message.error($t("模型管理器安装失败"))
            modelManagerInstallProgresShow.value = false
            clearInterval(timer)
            getVisibleModelList()
        }

        modelManagerInstallProgress.value = res.message
    }, 1000)

}


/**
 * @description 删除模型
 */
export async function removeModel() {
    const { modelForDel, modelDelLoading, modelDelConfirm } = getSettingsStoreData()
    const [model, parameters] = modelForDel.value.split(":")
    const res = await post("/manager/remove_model", { model, parameters })
    if (res.code == 200) {
        await getVisibleModelList()
        await get_model_list()
        eventBUS.$emit("modelInstalled")
        message.success($t("模型删除成功"))
    } else {
        message.error($t("模型删除失败:{0}", [res.error_msg]))
    }
    modelDelLoading.value = false
    modelDelConfirm.value = false
}


/**
 * @description 重新选择下载节点
 */
export async function reconnect_model_download() {
    const res: any = await post('/manager/reconnect_model_download', {});
    message.success(res.msg)
}

/**
 * @description 选择模型管理器安装地址
 */
export async function chooseOllamaPath() {
    const { modelManagerInstallPath } = getSettingsStoreData()
    const res = await post("/index/select_folder")
    if (res.code == 200) {
        modelManagerInstallPath.value = res.message.folder
    } else {
        console.log("cencel")
    }
}


/**
 * @description 设置ollama接入地址
 */
export async function setOllamaUrl() {
    const { ollamaUrl } = getSettingsStoreData()
    try {
        const res = await post("/manager/set_ollama_host", {
            ollama_host: ollamaUrl.value
        })
        if (res.code != 200) {
            message.error(res.msg!)
        } else {
            message.success($t("设置成功"))
            eventBUS.$emit("modelInstalled", "all")
        }
    } catch (error) {
        sendLog(error as Error)
        console.log(error)
    }
}


/**
 * @description 获取嵌入模型列表
 */
export async function getEmbeddingModels() {
    const { embeddingModelsList, createKnowledgeFormData } = getKnowledgeStoreData()
    try {
        const res = await post("/rag/get_embedding_models")
        embeddingModelsList.value = Object.values(res.message).flat()
        if (embeddingModelsList.value.length) {
            let findRes = embeddingModelsList.value.find((item: any) => {
                if (item.model.includes("bge-m3") && item.title.includes("ollama")) {
                    return item
                }
                return undefined
            })

            if (findRes === undefined) {
                findRes = embeddingModelsList.value.find((item: any) => {
                    if (item.model.includes("bge-m3")) {
                        return item
                    }
                    return undefined
                })
            }

            if (findRes) {
                createKnowledgeFormData.value.enbeddingModel = findRes.model
                createKnowledgeFormData.value.supplierName = findRes.supplierName
            } else {
                createKnowledgeFormData.value.enbeddingModel = embeddingModelsList.value[0].model
                createKnowledgeFormData.value.supplierName = embeddingModelsList.value[0].supplierName
            }
        }
    } catch (error) {
        sendLog(error as Error)
    }
}

/**
 * @description 安装模型
 */
export function installModelConfirm(modelInfo: { model: string, parameters: string }) {
    const { modelNameForInstall } = getSettingsStoreData()
    modelNameForInstall.value = modelInfo
    installModel()
}

/**
 * @description 刪除模型询问
 */
export function removeModelConfirm(model: string) {
    const { modelDelConfirm, modelForDel } = getSettingsStoreData()
    modelDelConfirm.value = true
    modelForDel.value = model
}

/**
 * @description 确认删除模型
 */
export function doRemoveModel() {
    const { modelDelLoading } = getSettingsStoreData()
    modelDelLoading.value = true
    removeModel()
    getVisibleModelList()
}

/**
 * @description 取消删除模型
 */
export function cancelRemoveModel() {
    const { modelDelConfirm, modelForDel } = getSettingsStoreData()
    modelDelConfirm.value = false
    modelForDel.value = ""
}

/**
 * @description 暂不安装模型管理器
 */
export function doNotInstallModelManagerNow() {
    const { settingsShow, managerInstallConfirm } = getSettingsStoreData()
    settingsShow.value = false
    managerInstallConfirm.value = false
}

/**
 * @description 搜索模型
 */
export const handleSearch = async () => {
    const { filterList, visibleModelList, search, modeType, pagination } = getSettingsStoreData()
    await getVisibleModelList()
    filterList.value = visibleModelList.value.filter((item) => {
        //模型含有搜索内容，且功能类型为选中的功能类型
        return item.full_name.toLowerCase().includes(search.value.toLowerCase()) && (modeType.value == "all" ? true : modeType.value === 'installed' ? item.install : item.capability.includes(modeType.value))
    })

    if (search.value == "") {
        pagination.value.page = 1
    }
}


