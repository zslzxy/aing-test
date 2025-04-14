import type { ActiveKnowledgeDocDto, ActiveKnowledgeDto, KnowledgeDocumentInfo, TestDocChunkParams } from "@/views/Home/dto";
import { defineStore, storeToRefs } from "pinia";
import { type DialogReactive } from "naive-ui"
import { ref } from "vue";

const useKnowledgeStore = defineStore("knowledgeStore", () => {
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
        chunkSize: 1000,
        overlapSize: 100,
        separators: []
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
    // 知识库宽度
    const knowledgeSiderWidth = ref(0)
    // 是否安装了bge-m3:latest（用于支持知识库）
    const isInstalledBge = ref(false)
    // 嵌入模型列表
    const embeddingModelsList = ref<any>([])
    // 是否使用自定义分隔符
    const customSeparators = ref(false)
    // 优化知识库进度弹窗
    const optimizeKnowledgeShow = ref(false)
    return {
        activeKnowledge,
        knowledgeList,
        addingKnowledge,
        createKnowledgeFormData,
        isEditKnowledge,
        createKnowledgeModelRef,
        createKnowledgeDialogIns,
        activeKnowledgeDto,
        knowledgeDragable,
        knowledgeDocFileList,
        knowledgeDirList,
        uploadMode,
        fileOrDirList,
        isUploadingDoc,
        chooseList,
        activeKnowledgeDocList,
        sliceRuleShow,
        sliceChunkFormData,
        sliceFormRef,
        slicePreviewList,
        docParseStatus,
        activeKnowledgeForChat,
        docContent,
        knowledgeSiderWidth,
        isInstalledBge,
        embeddingModelsList,    
        customSeparators,
        optimizeKnowledgeShow
    }
})

export function getKnowledgeStoreData() {
    return storeToRefs(useKnowledgeStore())
}