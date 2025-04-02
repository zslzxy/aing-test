import i18n from "@/lang";
import { createDiscreteApi, darkTheme, lightTheme, NButton, type ConfigProviderProps, type DialogOptions } from "naive-ui";
import { computed, ref } from "vue";
export function sendStreamedRequest(url: any, data: any, onProgress: any, onLoad: any, onError: any) {
    // 将数据转换为查询字符串
    const queryString = Object.keys(data).map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }).join('&');
    // 拼接完整的 URL
    const fullUrl = url + (url.includes('?') ? '&' : '?') + queryString;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fullUrl, true);
    xhr.responseType = 'text';
    // 处理进度事件
    xhr.onprogress = () => {
        const partialResponse = xhr.responseText;
        onProgress(partialResponse);
    };
    // 处理请求完成事件
    xhr.onload = () => {
        if (xhr.status === 200) {
            const fullResponse = xhr.responseText;
            onLoad(fullResponse);
        } else {
            onError(`${i18n.global.t("请求出错，状态码:")} ${xhr.status}`);
        }
    };
    // 处理请求错误事件
    xhr.onerror = () => {
        onError(i18n.global.t('请求发生错误'));
    };
    // 发送请求
    xhr.send();
}

/**
 * @description 发布订阅
 */
type EventBUS = {
    events: Record<string, ((data?: any) => void)[]>,
    $on: (eventName: string, fn: (data?: any) => void) => void,
    $emit: (eventName: string, data?: any) => void,
    $del: (eventName: string) => void
}
export const eventBUS: EventBUS = {
    events: {},
    $on(eventName, fn) {
        if (this.events[eventName]) {
            this.events[eventName].push(fn)
        } else {
            this.events[eventName] = [fn]
        }
    },
    $emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(fn => {
                fn(data)
            })
        }
    },
    $del(eventName) {
        if (this.events[eventName]) {
            delete this.events[eventName]
        }
    }
}

/**
 * @description naive-ui独立api
 */
