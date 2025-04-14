import { createApp } from 'vue'
import { createPinia } from 'pinia'

import i18n from './lang'
import App from './App.vue'
import router from './router'

import "@/assets/base.scss"
import "@/assets/theme"
import 'uno.css'
import "highlight.js/styles/a11y-light.min.css"
import { post } from './api'


const app = createApp(App)
app.use(i18n);

app.use(createPinia())
app.use(router)


app.config.errorHandler = function(err){
    console.log(err)
    post("/index/write_logs",{logs:JSON.stringify(err)}).then(res=>console.log("发送成功"))
}

// src/utils/mathjax.js
// @ts-ignore
// window.MathJax = {
//     tex: {
//         inlineMath: [
//             ["$", "$"],
//             ["\\(", "\\)"],
//             ["\(", "\)"],
//             ["\\[", "\\]"],
//         ], // 行内公式选择符
//         displayMath: [
//             ["$$", "$$"],
//             ["\\[", "\\]"],
//             ['?', '?'],
//         ], // 段内公式选择符
//     },
//     startup: {
//         ready() {
//             // @ts-ignore
//             MathJax.startup.defaultReady();
//         },
//     },
// };

app.mount('#app')
