// 聊天头像
import userImage from "@/assets/images/user.png"
import codellama from "@/assets/images/codellama.png"
import deepseek from "@/assets/images/deepseek.png"
import gemma from "@/assets/images/gemma.png"
import llama from "@/assets/images/llama.png"
import llava from "@/assets/images/llava.png"
import mistral from "@/assets/images/mistral.png"
import mxbai from "@/assets/images/mxbai.png"
import phi4 from "@/assets/images/phi4.png"
import qwen from "@/assets/images/qwen.png"
import starcoder from "@/assets/images/starcoder.png"
import tinyllama from "@/assets/images/tinyllama.png"
import AingDesk from "@/assets/images/logo.png"

import { sendChat } from "@/views/ChatTools/controller"

import { message } from "@/utils/naive-tools"
import { useClipboard } from "@vueuse/core"
import i18n from "@/lang"
import type { MultipeQuestionDto } from "@/views/Home/dto"
import { getHeaderStoreData } from "@/views/Header/store"
import { getChatContentStoreData } from "@/views/ChatContent/store"
import { getChatToolsStoreData } from "@/views/ChatTools/store"
import { getAnswerStoreData } from "../store"




export const logos: any = {
    codellama,
    deepseek,
    gemma,
    llama,
    llava,
    mistral,
    mxbai,
    phi4,
    qwen,
    starcoder,
    tinyllama,
}

export { AingDesk }
const $t = i18n.global.t

/**
 * @description 复制回答内容
 */
const { copy } = useClipboard({ source: "" })
export async function copyContent(text: string) {
    await copy(text.replace(/<div class="thought-placeholder">(.*?)<\/div>/gs, ""))
    message.success($t("复制成功"))
}

/**
 * @description 根据模型确定对应的图标
 */
export const answerLogo = (model: string) => {
    let logo = null
    Object.keys(logos).forEach(item => {
        {
            if (model.includes(item)) {
                logo = logos[item]
            }
        }
    })

    if (logo) {
        return logo
    } else {
        return AingDesk
    }
}

/**
 * @description 重新回答
 */
export function answerAgain(question: MultipeQuestionDto, id: string) {
    const { currentModel, } = getHeaderStoreData()
    const { isInChat, chatHistory, } = getChatContentStoreData()
    if (isInChat.value) {
        message.warning($t("当前正在回答，请稍后"))
    } else {
        isInChat.value = true
        // 拼接完整key  
        // TODO:此处暂时的方案是追加一个重新回答的记录，后续根据情况决定是否优化
        const chatKey = {
            content: question.content.replace(/^\d+--/, ''),
            files: question.files,
            images: question.images
        }
        chatHistory.value.set(chatKey, { content: "", stat: { model: currentModel.value }, search_result: [] })
        sendChat({
            user_content: chatKey.content,
            images: chatKey.images?.join(","),
            doc_files: chatKey.files?.join(","),
            regenerate_id: id
        })
    }
}

// TODO:目前不确定AI返回的latex公式是否正确，参考Latex和Katex的规范，先全面使用$$...$$代替
/**
 * @description 替换数学公式中的分隔符为$$
 */
export function replaceLatexMathDelimiters(text: string) {
    // 替换块级公式：\[...\] → $$...$$
    text = text.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
    // 替换行内公式：\(...\) → $$...$$
    text = text.replace(/\\\(/g, '$$').replace(/\\\)/g, '$$');
    // 替换公式环境：\begin{xxx}...\end{xxx} → $$...$$
    text = text.replace(/\\begin\{(\w+)\}/g, '$$').replace(/\\end\{(\w+)\}/g, '$$');

    return text;
}

/**
 * @description markdown渲染结束后立即进行工具、思考等处理过程
 */
export function dealThinkAndTools() {
    let timer: any = null
    const { questionContent, } = getChatToolsStoreData()
    const { markdownRef} = getAnswerStoreData()
    return () => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        } else {
            timer = setTimeout(() => {
                // 处理工具条
                const toolHeaders = markdownRef.value?.querySelectorAll(".tool-header")
                if (toolHeaders?.length) {
                    toolHeaders.forEach(item => {
                        const copyBtns = item.querySelectorAll(".tool-copy")
                        const referenceBtns = item.querySelectorAll(".tool-reference")
                        // 监听工具栏的拷贝内容
                        copyBtns.forEach((copyBtn) => {
                            copyBtn.addEventListener("click", () => {
                                copy(decodeURIComponent((copyBtn as HTMLSpanElement).dataset.code as string))
                                message.success($t("复制成功"))
                            })
                        })

                        // 监听引用工具操作
                        referenceBtns.forEach(referenceBtn => {
                            referenceBtn.addEventListener("click", () => {
                                questionContent.value = decodeURIComponent((referenceBtn as HTMLSpanElement).dataset.code as string)
                            })
                        })
                    })
                }
            }, 300)
        }
    }
}

/**
 * @description 跳转到对应目标页
 */
export function jumpThroughLink(link: string) {
    window.open(link)
}


