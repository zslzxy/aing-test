export default {
    // 语言选择本地存储
    get language() {
        return localStorage.getItem("language") as string
    },
    set language(lang: string) {
        localStorage.setItem("language", lang)
    },

    // 暗黑模式本地存储
    get themeMode() {
        return localStorage.getItem("themeMode") as string
    },

    set themeMode(mode: string) {
        localStorage.setItem("themeMode", mode)
    },

    // 
}