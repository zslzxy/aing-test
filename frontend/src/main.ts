import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import "@/assets/base.scss"
import 'uno.css'
import "highlight.js/styles/a11y-light.min.css"
import i18n from './lang'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
