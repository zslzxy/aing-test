import { createI18n } from 'vue-i18n'
import { reactive, ref } from 'vue'
import allLang from "@/bt-i18n/all"
import storage from '@/utils/storage'
// import useIndexStore from '@/views/Home/store'
let lang = ref(localStorage.getItem('language') || "zh")
const i18n = createI18n({
    legacy: false,
    locale: lang.value,
    messages: allLang
})

/**
 * @description 设置语言包
 */
export function setLang(lang: keyof typeof allLang) {
    i18n.global.locale.value = lang
    storage.language = lang
}
export default i18n