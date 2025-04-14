import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import i18n from "@/lang";
import type { InstallProgress } from "@/views/Home/dto";

const useSettingsStore = defineStore("settings", () => {
    // 设置弹窗
    const settingsShow = ref(false)
    // 机器配置信息
    const pcInfo = ref<Record<string, any>>({})
    // 可用模型列表
    const visibleModelList = ref<any[]>([])
    // 模型筛选关键字
    const modeType = ref("all")
    // 要安裝的模型名称
    const modelNameForInstall = ref<{ model: string; parameters: string }>({
        model: "",
        parameters: ""
    })
    // 安装模型的弹窗
    const installShow = ref(false)
    // 模型安装进度
    const modelInstallProgress = ref<InstallProgress>({
        status: 0,
        digest: "",
        total: 0,
        completed: 0,
        progress: 0,
        speed: 0
    })
    // 等待删除的大模型
    const modelForDel = ref("")
    // 删除大模型进度
    const modelDelLoading = ref(false)
    // 删除模型问询
    const modelDelConfirm = ref(false)
    // 模型管理器安装进度
    const modelManagerInstallProgress = ref<InstallProgress>({
        status: 0,
        digest: "",
        total: 0,
        completed: 0,
        progress: 0,
        speed: 0
    })
    // 模型管理器安装提示
    const modelManagerInstallNotice = ref("")
    // 模型管理器安装的位置
    const modelManagerInstallPath = ref("")
    // 模型管理器安装进度弹窗
    const modelManagerInstallProgresShow = ref(false)
    // 模型管理器安装问询
    const managerInstallConfirm = ref(false)
    // 选择需要安装的模型管理器
    const managerForInstall = ref("ollama")
    // 是否安装了模型管理器
    const isInstalledManager = ref(false)
    // 下载展示文案
    const downloadText = ref(i18n.global.t("正在连接，请稍候..."))
    // ollama接入地址
    const ollamaUrl = ref("")
    // 重新设定模型列表(安装ollama模型管理器后手动刷新一次数据)
    const isResetModelList = ref({
        status: false, // 是否刷新完成
        type: 0, // 0:默认，1: 重置模型列表
    })
    // 搜索过滤后的模型列表
    const filterList = ref<any[]>([])
    // 搜索模型关键字
    const search = ref("")
    // 模型列表分页
    const pagination = ref({
        page: 1,
        pageSize: 10,
        showSizePicker: true,
        pageSizes: [10, 50, 100],
        onChange: (page: number) => {
            pagination.value.page = page
        },
        onUpdatePageSize: (pageSize: number) => {
            pagination.value.pageSize = pageSize
            pagination.value.page = 1
        }
    })
    return {
        settingsShow,
        pcInfo,
        visibleModelList,
        modeType,
        modelNameForInstall,
        installShow,
        modelInstallProgress,
        modelForDel,
        modelDelLoading,
        modelDelConfirm,
        modelManagerInstallProgress,
        modelManagerInstallNotice,
        modelManagerInstallPath,
        modelManagerInstallProgresShow,
        managerInstallConfirm,
        managerForInstall,
        isInstalledManager,
        downloadText,
        ollamaUrl,
        isResetModelList,
        filterList,
        search,
        pagination
    }
})

export function getSettingsStoreData() {
    return storeToRefs(useSettingsStore())
}