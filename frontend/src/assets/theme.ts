import { eventBUS } from "@/views/Home/utils/tools";
import storage from "@/utils/storage";
export function themeChange(theme:string) {
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--bt-tit-color-secondary', '#ffffff'); 
        document.documentElement.style.setProperty('--bt-notice-text-color', '#b5b5b5'); 
        document.documentElement.style.setProperty('--bt-list-item-hover', 'rgba(22, 163, 74, .5)'); 
        document.documentElement.style.setProperty('--bt-panel', '#2c2c2c'); 
      } else {
        document.documentElement.style.setProperty('--bt-tit-color-secondary', '#73767a'); 
        document.documentElement.style.setProperty('--bt-notice-text-color', '#545454'); 
        document.documentElement.style.setProperty('--bt-list-item-hover', 'rgba(28, 196, 90, 0.1)'); 
        document.documentElement.style.setProperty('--bt-panel', '#ffffff'); 
      }
}

themeChange(storage.themeMode)
eventBUS.$on("themeChange",themeChange)

