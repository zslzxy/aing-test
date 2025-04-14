import type { AgentItemDto } from "@/views/Home/dto";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";


const useAgentStore = defineStore("agentStore", () => {
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
    // 当前对话的智能体
    const currentChatAgent = ref<AgentItemDto | null>()
    return {
        agentShow,
        agentList,
        createAgentShow,
        createAgentFormData,
        isEditAgent,
        chatForAgent,
        currentAgent,
        currentChatAgent
    }
})

export function getAgentStoreData() {
    return storeToRefs(useAgentStore())
}