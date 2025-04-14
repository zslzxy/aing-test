import type { ChatInfo } from "@/views/Home/dto";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";

const useChatContentStore = defineStore("chatContentStore", () => {
    // 滚动条
    const scrollRef = ref()
    const contentWrapper = ref()
    // 聊天记录
    const chatHistory = ref<ChatInfo>(new Map())
    // 用户是否手动滚动
    const userScrollSelf = ref(false)
    // 记录滚动距离
    const scrollTop = ref(0)
    // 是否正在对话
    const isInChat = ref(false)
    // 新手对话引导
    const guideActive = ref(true)
    // 当前正在进行对话的id
    const currentTalkingChatId = ref("")
    return {
        scrollRef,
        contentWrapper,
        chatHistory,
        userScrollSelf,
        scrollTop,
        isInChat,
        guideActive,
        currentTalkingChatId
    }
})

export function getChatContentStoreData() {
    return storeToRefs(useChatContentStore())
}