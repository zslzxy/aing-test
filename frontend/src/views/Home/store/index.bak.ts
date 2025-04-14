import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import i18n from "@/lang";
import { type DialogReactive } from "naive-ui"
import storage from "@/utils/storage";


export type ChatItemInfo = {
    agent_info?: AgentItemDto,
    contextPath: string
    context_id: string
    model: string
    parameters: string,
    title: string,
    rag_list?: string[],
    search_type?: string,
    supplierName?: string
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

// 带有文本、图片、文件的提问实体
export type MultipeQuestionDto = {
    content: string,
    files?: string[],
    images?: string[]
}
// 对话信息实体
export type ChatInfo = Map<MultipeQuestionDto, {
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
    ragName: string,
    embeddingModel: string,
    embeddingModelExist: boolean,
    errorMsg: string,
    keywordWeight: number,
    maxRecall: number,
    queryRewrite: number,
    ragCreateTime: number,
    recallAccuracy: number,
    rerankModel: string,
    resultReordering: number,
    searchStrategy: number,
    supplierName: string,
    vectorWeight: number,
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
// 第三方api服务商实体
export type ThirdPartyApiServiceItem = {
    apiKey: string
    baseUrl: string
    baseUrlExample: string
    help: string
    home: string
    isUseUrlExample: boolean
    supplierName: string
    supplierTitle: string
    status: boolean,
    icon: string,
    sort: string
}

// api服务商下的模型列表
export type SupplierModelItem = {
    capability: Array<string>
    modelName: string
    supplierName: string,
    status: boolean,
    title: string
}

// 添加模型服务商表单数据
export type AddSupplierFormData = {
    supplierTitle: string,
    supplierName: string,
    baseUrl: string,
    apiKey: string,
}

// 服务商配置信息
export type SupplierConfigInfo = {
    baseUrl: string,
    apiKey: string,
}

// 当前模型的可选实体
export type CurrentModelDto = {
    model?: string,
    parameters?: string,
    supplierName?: string,
}

// 智能体对象实体
export type AgentItemDto = {
    agent_name: string,
    agent_title: string,
    prompt: string,
    msg: string,
    agent_type: string,
    icon: string,
    create_time: number,
    is_system: boolean,
}

//  创建知识库表单实体
export type CreateKnowledgeFormData = {
    ragName: string,
    ragDesc: string,
    supplierName?: string,
    enbeddingModel: string | string[],
    searchStrategy?: number,
    maxRecall?: number,
    recallAccuracy?: number,
    resultReordering?: number,
    rerankModel?: string,
    queryRewrite?: number,
    vectorWeight?: number,
    keywordWeight?: number,
}

// 测试文档分片参数实体
export type TestDocChunkParams = {
    filename: string,
    chunkSize: number,
    overlapSize: number,
    separators: string[],
}

// 供应商图片
const supplierLogs = new Map([
    ["DeepSeek", ""],
    ["HunYuan", ""],
    ["Kimi", ""],
    ["PaddleAI", ""],
    ["qanwen", ""],
    ["QianFan", ""],
    ["SiliconFlow", ""],
    ["VolcEngine", ""],
])


const useIndexStore = defineStore("indexStore", () => {
    // 滚动条
    const scrollRef = ref()
    const contentWrapper = ref()
    // 版本号
    const version = ref("1.0.0")
    // 侧边栏宽度
    const siderWidth = ref(220)
    // 是否关闭侧边栏
    const isFold = ref(false)
    // 提问内容
    const questionContent = ref("")
    // 提问上传文件列表
    const questionFileList = ref<any>([])
    // 提问上传的图片列表
    const questionImageList = ref<any>([])
    // 提问上传的文件缓存
    const questionFilesCache = ref<File[]>([])
    // 提问的文件域
    const questionFilesRef = ref()
    // 提问携带的文件
    const questionFiles = ref<string[]>([])
    // 提问携带的图片
    const questionImages = ref<string[]>([])
    // 提问内容缓存
    // 答案的代码内容
    const answerCodeContent = ref("")
    // 已安裝模型列表
    const modelList = ref<any>([])
    // 当前模型实体
    const currentModelDto = ref<CurrentModelDto | null>()
    // 当前使用的模型
    const currentModel = ref("")
    // 当前对话的id
    const currentContextId = ref("")
    // 当前对话标题
    const currentChatTitle = ref("")
    // 当前对话的智能体
    const currentChatAgent = ref<AgentItemDto | null>()
    // 开启单次临时对话
    const temp_chat = ref(false)
    // 当前对话的知识库
    const currentChatKnowledge = ref<Array<string> | null>(null)
    // 当前对的搜索
    const currentChatSearch = ref<string | null>(null)
    // 当前对话的文件附件
    const cuttentChatFileList = ref([])
    // 根据模型状态确定当前对话是否可用
    const chatMask = ref({
        status: false,
        notice: ""
    })
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
    // 嵌入模型列表
    const embeddingModelsList = ref<any>([])
    // 知识库列表
    const knowledgeList = ref<Array<KnowledgeDocumentInfo>>([])
    // 当前正在新增知识库（input出现）
    const addingKnowledge = ref(false)
    // 新建知识库的数据体
    const createKnowledgeFormData = ref<any>({
        ragName: "",
        ragDesc: "",
        enbeddingModel: "",
        supplierName: "",
        maxRecall: 5,
    })
    // 是否正在编辑知识库
    const isEditKnowledge = ref(false)
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
    // 文档选择结束后弹窗展示分片设置规则
    const sliceRuleShow = ref(false)
    // 文档分片表单数据
    const sliceChunkFormData = ref<TestDocChunkParams>({
        filename: "",
        chunkSize: 500,
        overlapSize: 50,
        separators: ['\\n\\n', '。']
    })
    // 文档分片表单ref
    const sliceFormRef = ref()
    // 分片预览结果列表
    const slicePreviewList = ref<string[]>([])
    // 文档解析状态
    const docParseStatus = ref(false)
    // 用于聊天的知识库
    const activeKnowledgeForChat = ref<string[]>([])
    // 单篇知识库文档内容
    const docContent = ref("")
    // 欢迎弹窗显示
    const welcomeShow = ref(false)
    // 第三方api配置弹窗
    const thirdPartyApiShow = ref(false)
    // 第三方api服务商列表
    const thirdPartyApiServiceList = ref<ThirdPartyApiServiceItem[]>([])
    // 当前选中的第三方api服务商
    const currentChooseApi = ref<ThirdPartyApiServiceItem>()
    // api服务商下的模型列表
    const supplierModelList = ref<SupplierModelItem[]>([])
    // 添加第三方api服务商下属模型弹窗
    const addSupplierModel = ref(false)
    // 添加模型的表单对象
    const addModelFormData = ref<{ modelName: string, capability: string[], title: string }>({ modelName: "", capability: [], title: "" })
    // 配置模型服务商数据
    const applierServiceConfig = ref<SupplierConfigInfo>({
        baseUrl: "",
        apiKey: ""
    })
    // 是否启用了全部模型
    const isAllModelEnable = ref(false)
    // 添加模型服务商
    const addSupplierShow = ref(false)
    // 添加模型服务商表单数据
    const addSupplierFormData = ref<AddSupplierFormData>({
        supplierTitle: "",
        supplierName: "",
        baseUrl: "",
        apiKey: ""
    })
    // 是否修改服务商标题
    const currentModelNameForEdiit = ref("")
    // 当前使用的服务商
    const currentSupplierName = ref("")
    // 智能体弹窗显示隐藏
    const agentShow = ref(false)
    // 智能体列表
    const agentList = ref<AgentItemDto[]>([])
    // 创建智能体弹窗显示
    const createAgentShow = ref(false)
    // 创建智能体表单数据
    const createAgentFormData = ref({
        agent_type: "",
        agent_name: "",
        agent_title: "",
        prompt: "",
        icon: "😀"
    })
    // 是否为编辑智能体
    const isEditAgent = ref(false)
    // 对话时，是否为智能体
    const chatForAgent = ref(false)
    // 当前智能体
    const currentAgent = ref<AgentItemDto | null>()
    // ollama接入地址
    const ollamaUrl = ref("")
    // 新手对话引导
    const guideActive = ref(true)
    // 获取用户数据存储位置
    const userDataPath = ref("")
    // 数据迁移检查
    const dataPathChangeCheckShow = ref(false)
    // 数据迁移状态指标值
    const dataPathChangeStatusValues = ref({
        status: 0,  // 0:未开始，1:正在复制,2:复制完成,-1:复制失败
        speed: 0,
        total: 0,
        current: 0,
        percent: 0,
        startTime: 0,
        endTime: 0,
        fileTotal: 0,
        fileCurrent: 0,
        message: "",
        error: ""
    })
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
        questionFiles,
        questionImages,
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
        docContent,
        welcomeShow,
        thirdPartyApiShow,
        thirdPartyApiServiceList,
        currentChooseApi,
        supplierModelList,
        addSupplierModel,
        addModelFormData,
        applierServiceConfig,
        isAllModelEnable,
        addSupplierShow,
        addSupplierFormData,
        currentModelNameForEdiit,
        currentSupplierName,
        embeddingModelsList,
        currentModelDto,
        cuttentChatFileList,
        chatMask,
        temp_chat,
        version,
        agentShow,
        createAgentShow,
        createAgentFormData,
        agentList,
        isEditAgent,
        chatForAgent,
        currentAgent,
        currentChatAgent,
        modelManagerInstallPath,
        ollamaUrl,
        guideActive,
        isEditKnowledge,
        modeType,
        questionFileList,
        questionImageList,
        questionFilesCache,
        questionFilesRef,
        sliceRuleShow,
        sliceChunkFormData,
        sliceFormRef,
        slicePreviewList,
        userDataPath,
        dataPathChangeCheckShow,
        dataPathChangeStatusValues,
        scrollRef,
        contentWrapper
    }
})

export default useIndexStore


export function getIndexStore(){
    return storeToRefs(useIndexStore())
}