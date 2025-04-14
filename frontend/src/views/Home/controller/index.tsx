import { get, post } from "@/api";

// 模拟请求
import i18n from "@/lang";
import { getSoftSettingsStoreData } from "@/views/SoftSettings/store";
import { getHeaderStoreData } from "@/views/Header/store";
import { getChatToolsStoreData } from "@/views/ChatTools/store";
const $t = i18n.global.t

/**
 * @description 日志上报
 */
export async function sendLog(err: Error) {
    console.log([err])
    post("/index/write_logs", { logs: err.stack })
}

/**
 * @description 获取版本号
 */
export async function getVersion() {
    const { version } = getSoftSettingsStoreData()
    const { message: { version: version_val } } = await get("index/get_version")
    version.value = version_val
}

/**
 * @description 判断某个模型是否已安装
 */
export function isInstalled(model: string) {
    try {
        let flag = false
        const { modelList } = getHeaderStoreData()
        modelList.value.forEach((item: any) => {
            if (item.label == model) flag = true
        })
        return flag
    } catch (error) {
        sendLog(error as Error)
    }
}


/**
 * @description 调用搜索引擎
 */
export async function callSearchEngine() {
    const { targetNet,  } = getSoftSettingsStoreData()
    const {questionContent} = getChatToolsStoreData()
    try {
        await post("/search/search", { query: questionContent.value, searchProvider: targetNet.value })
    } catch (error) {
        sendLog(error as Error)
    }
}
