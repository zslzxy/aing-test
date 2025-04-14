import { getSoftSettingsStoreData } from "@/views/SoftSettings/store";
import { defineStore,storeToRefs } from "pinia";

const useGlobalStore = defineStore("globalStore", () => {
    // 侧边栏响应式背景
    const siderBg = computed(()=>{
        const { themeMode } = getSoftSettingsStoreData()
        if(themeMode.value === 'light'){
            return "var(--gray-1)"
        }else{
            return "var(--gray-9)"
        }
    })

    // 设置面板中边框样式
    const settingPanelBorder = computed(()=>{
        const { themeMode } = getSoftSettingsStoreData()
        if(themeMode.value === 'light'){
            return "1px solid var(--gray-3)"
        }else{
            return "1px solid var(--gray-7)"
        }
    })

    return {
        siderBg,
        settingPanelBorder
    }
})

export function getGlobalStore(){
    return storeToRefs(useGlobalStore())
}