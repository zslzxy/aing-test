import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";

const useIndexStore = defineStore("indexStore", () => {
    // 欢迎弹窗显示
    const welcomeShow = ref(false)
    return {
        welcomeShow,
    }
})

export default useIndexStore


export function getIndexStore(){
    return storeToRefs(useIndexStore())
}