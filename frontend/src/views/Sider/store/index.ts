import type { ChatItemInfo } from "@/views/Home/dto";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";

const useSiderStore = defineStore("siderStore", () => {
    // 侧边栏宽度
    const siderWidth = ref(220)
    // 是否关闭侧边栏
    const isFold = ref(false)
    // 对话列表
    const chatList = ref<ChatItemInfo[]>([])
    // 当前对话的id
    const currentContextId = ref("")
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
    // 当前对话标题
    const currentChatTitle = ref("")
    return {
        siderWidth,
        isFold,
        chatList,
        currentContextId,
        chatRemoveConfirm,
        chatModifyConfirm,
        contextIdForDel,
        contextIdForModify,
        newChatTitle,
        currentChatTitle
    }
})


export function getSiderStoreData() {
    return storeToRefs(useSiderStore())
}