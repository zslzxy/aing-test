import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";



const useAnswerStore = defineStore("answerStore", () => {
    const markdownRef = ref<HTMLElement | null>()
    const svgWrapper = ref<HTMLElement>()
    const showSvg = ref(false)

    return {
        markdownRef,
        svgWrapper,
        showSvg
    }
})

export function getAnswerStoreData() {
    return storeToRefs(useAnswerStore())
}