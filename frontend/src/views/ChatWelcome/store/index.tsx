import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import type { ChatInfo, AgentItemDto } from "@/views/Home/dto"

const useChatStore = defineStore("chatStore", () => {
    

    return {
        
    }
})

export function getChatStoreData() {
    return storeToRefs(useChatStore())
}