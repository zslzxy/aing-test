import { defineStore } from "pinia";
import { ref } from "vue";
import i18n from "@/lang";
import { type DialogReactive } from "naive-ui"
import storage from "@/utils/storage";

export type ChatItemInfo = {
    contextPath: string
    context_id: string
    model: string
    parameters: string,
    title: string,
    rag_list?: string[],
    search_type?: string
}

// 模型安装进度实体
export type InstallProgress = {
    status?: number
    digest?: string
    total?: number
    completed?: number
    progress?: number
    speed?: number
}
// 对话信息实体
export type ChatInfo = Map<string, {
    content: string,
    id?: string
    stat?: {
        model?: string,
        created_at?: string,
        total_duration?: string,
        load_duration?: string,
        prompt_eval_count?: string,
        prompt_eval_duration?: string,
        eval_count?: string,
        eval_duration?: string,
    },
    search_result?: Array<{ content: string; link: string; title: string }>
}>
// 知识库类型实体
export type KnowledgeDocumentInfo = {
    ragDesc: string
    ragName: string
}
// 当前选中知识库类型实体
export type ActiveKnowledgeDto = KnowledgeDocumentInfo

// 当前知识库的文档实体（单个）
export type ActiveKnowledgeDocDto = {
    doc_abstract: string
    doc_file: string
    doc_id: string
    doc_keywords: string[]
    doc_name: string
    doc_rag: string
    is_parsed: number
    md_file: string
    update_time: number
}

const useIndexStore = defineStore("indexStore", () => {
    // 侧边栏宽度
    const siderWidth = ref(220)
    // 是否关闭侧边栏
    const isFold = ref(false)
    // 提问内容
    const questionContent = ref("")
    // 提问内容缓存

    // 答案的代码内容
    const answerCodeContent = ref("")
    // 已安裝模型列表
    const modelList = ref([])
    // 当前使用的模型
    const currentModel = ref("")
    // 当前对话的id
    const currentContextId = ref("")
    // 当前对话标题
    const currentChatTitle = ref("")
    // 当前对话的知识库
    const currentChatKnowledge = ref<Array<string> | null>(null)
    // 当前对的搜索
    const currentChatSearch = ref<string | null>(null)
    // 当前正在进行对话的id
    const currentTalkingChatId = ref("")
    // 删除对话弹窗
    const chatRemoveConfirm = ref(false)
    // 修改对话弹窗
    const chatModifyConfirm = ref(false)
    // 等待删除的对话id
    const contextIdForDel = ref("")
    // 等待修改标题的对话id
    const contextIdForModify = ref("")
    // 新的对话标题
    const newChatTitle = ref("")
    // 模型返回的答案内容
    const modelAnswerContent = ref("")
    // 对话列表
    const chatList = ref<ChatItemInfo[]>([])
    // 是否正在对话
    const isInChat = ref(false)
    // 聊天记录
    const chatHistory = ref<ChatInfo>(new Map())
    // 设置弹窗
    const settingsShow = ref(false)
    // 机器配置信息
    const pcInfo = ref<Record<string, any>>({})
    // 分享信息
    const shareShow = ref(false)
    // 分享地址
    const shareUrl = ref("")
    // 分享历史列表
    const shareHistory = ref([])
    // 修改分享弹窗
    const modifyShareShow = ref(false)
    // 删除分享问询弹窗
    const delShareConfirmShow = ref(false)
    // 可用模型列表
    const visibleModelList = ref<any[]>([])
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
    // 用户是否手动滚动
    const userScrollSelf = ref(false)
    // 记录滚动距离
    const scrollTop = ref(0)
    // 重新设定模型列表(安装ollama模型管理器后手动刷新一次数据)
    const isResetModelList = ref({
        status: false, // 是否刷新完成
        type: 0, // 0:默认，1: 重置模型列表
    })
    // 风格模式
    const themeMode = ref(storage.themeMode || "light")
    // 风格模式下相关背景色
    const themeColors = ref({
        // markdown代码部分背景
        markdownCodeLight: "#F9FAFB",
        markdownCOdeDark: "rgb(97 96 96 / 14%)",
        // markdown代码工具条背景
        markdownToolsLight: "#F3F4F6",
        markdownToolsDark: "rgb(97 96 96 / 34%)",
        // markdown工具条文本颜色
        markdownToolsFontColorLight: "#545454",
        markdownToolsFontColorDark: "inherit",
        // 深度思考部分
        thinkWrapperLight: "#f5f5f5",
        thinlWrapperDark: "rgb(97 96 96 / 14%)",
        // 提问框背景
        questionToolBgLight: "transparent",
        questionToolBgDark: "#28282C"
    })
    // 语言选择
    const languageOptions = ref([])
    // 当前语言
    const currentLanguage = ref(storage.language || "zh")
    // 联网搜索
    const targetNet = ref("baidu")
    // 激活联网搜索
    const netActive = ref(false)
    // 联网搜索结果
    const searchResult = ref([])
    // 知识库宽度
    const knowledgeSiderWidth = ref(0)
    // 是否安装了bge-m3:latest（用于支持知识库）
    const isInstalledBge = ref(false)
    // 知识库列表
    const knowledgeList = ref<Array<KnowledgeDocumentInfo>>([])
    // 当前正在新增知识库（input出现）
    const addingKnowledge = ref(false)
    // 新建知识库的数据体
    const createKnowledgeFormData = ref({
        ragName: "",
        ragDesc: "",
    })
    // 新建知识库的弹窗ref
    const createKnowledgeModelRef = ref()
    // 新建知识库的弹窗实例
    const createKnowledgeDialogIns = ref<DialogReactive>()
    // 当前激活的知识库
    const activeKnowledge = ref<string | null>(null)
    // 当前激活的知识库的实体
    const activeKnowledgeDto = ref<ActiveKnowledgeDto | null>(null)
    // 知识库拖拽上传
    const knowledgeDragable = ref(false)
    // 等待上传的文档集合
    const knowledgeDocFileList = ref([])
    // 等待上传的目录集合
    const knowledgeDirList = ref([])
    // 上传类型
    const uploadMode = ref("file")
    // 等待上传的文件/文件夹列表
    const fileOrDirList = ref<string[]>([])
    // 当前是否正在上传
    const isUploadingDoc = ref(false)
    // 实际选择的文件列表
    const chooseList = ref<any>([])
    // 当前知识库文档列表
    const activeKnowledgeDocList = ref<ActiveKnowledgeDocDto[]>([])
    // 文档解析状态
    const docParseStatus = ref(false)
    // 用于聊天的知识库
    const activeKnowledgeForChat = ref<string[]>([])
    // 单篇知识库文档内容
    const docContent = ref("这是一篇知识库的内容文档，这是一个知识库的内容")
    return {
        answerCodeContent,
        modelList,
        currentModel,
        currentContextId,
        modelAnswerContent,
        chatList,
        siderWidth,
        isFold,
        questionContent,
        chatHistory,
        settingsShow,
        pcInfo,
        shareShow,
        visibleModelList,
        modelNameForInstall,
        modelInstallProgress,
        installShow,
        modelForDel,
        modelDelLoading,
        chatRemoveConfirm,
        contextIdForDel,
        managerInstallConfirm,
        managerForInstall,
        modelManagerInstallProgress,
        modelManagerInstallProgresShow,
        isInstalledManager,
        contextIdForModify,
        chatModifyConfirm,
        newChatTitle,
        currentChatTitle,
        currentTalkingChatId,
        downloadText,
        userScrollSelf,
        scrollTop,
        isResetModelList,
        isInChat,
        themeMode,
        themeColors,
        languageOptions,
        currentLanguage,
        modelDelConfirm,
        shareUrl,
        shareHistory,
        modifyShareShow,
        delShareConfirmShow,
        modelManagerInstallNotice,
        targetNet,
        searchResult,
        knowledgeSiderWidth,
        knowledgeList,
        addingKnowledge,
        netActive,
        createKnowledgeFormData,
        createKnowledgeModelRef,
        createKnowledgeDialogIns,
        activeKnowledge,
        knowledgeDragable,
        isInstalledBge,
        activeKnowledgeDto,
        knowledgeDocFileList,
        knowledgeDirList,
        uploadMode,
        fileOrDirList,
        activeKnowledgeDocList,
        chooseList,
        activeKnowledgeForChat,
        isUploadingDoc,
        currentChatKnowledge,
        currentChatSearch,
        docParseStatus,
        docContent
    }
})

export default useIndexStore