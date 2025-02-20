<template>
    <div class="content-wrapper" ref="contentWrapper">
        <div class="chat-window">
            <NScrollbar style="height: 100%;padding:0 var(--bt-pd-small)" ref="scrollRef"
                content-style="overflow: hidden;" :on-scroll="scrollCallback">
                <!-- 新对话默认展示内容 -->
                <div class="answer" v-if="Object.values(chatHistory).length == 0">
                    <NImage :src="userImage" width="30" height="30" preview-disabled />
                    <div class="answer-token">
                        <p>{{ $t("让我们开启一段新的对话吧") }}</p>
                    </div>
                </div>

                <template v-for="[key, chatContent] in chatHistory" :key="key">
                    <!-- 提问 -->
                    <div class="question-edit" v-if="questionEditContent == key">
                        <NInput type="textarea" style="width: 60%;" v-model:value="questionEditCOntentForSend" />
                        <div class="operation-btns">
                            <!-- <NButton type="default" @click="questionEditCancel">取消</NButton>
                            <NButton type="primary" @click="questionEditConfirm">确认并重新回答</NButton> -->
                        </div>
                    </div>

                    <div class="question" v-else>
                        <NImage :src="userImage" width="30" height="30" class="mt-6px" preview-disabled />
                        <div class="question-token" v-html="key.replace(/^\d+--/, '')"></div>
                        <div class="tools">
                            <NTooltip>
                                <template #trigger>
                                    <span class="tool-item" @click="copyQuestion(key.replace(/^\d+--/, ''))"><i
                                            class="i-common:copy w-20 h-20"></i></span>
                                </template>
                                复制
                            </NTooltip>
                            <!-- <NTooltip>
                                <template #trigger>
                                    <span class="tool-item" @click="editQuestion(key)"><i
                                            class="i-common:edit w-20 h-20"></i></span>
                                </template>
                                编辑
                            </NTooltip> -->
                        </div>
                    </div>

                    <!-- 回答 -->
                    <div class="answer">
                        <NImage :src="answerLogo(chatContent.stat!.model as string)" width="30" height="30"
                            preview-disabled />
                        <div class="answer-token flex items-center gap-5" v-if="!chatContent.content">
                            <NSpin :size="20" />{{ $t("正在思考...") }}
                        </div>
                        <div class="answer-token" v-else>
                            <MarkdownRender :content="chatContent.content" />
                            <div class="tools">
                                <NTooltip>
                                    <template #trigger>
                                        <span class="tool-item" @click="copyContent(chatContent.content)"><i
                                                class="i-common:copy w-20 h-20"></i></span>
                                    </template>
                                    {{ $t("复制") }}
                                </NTooltip>
                                <NTooltip>
                                    <template #trigger>
                                        <span class="tool-item"><i class="i-common:attention w-20 h-20"></i></span>
                                    </template>
                                    <div class="flex justify-center items-start flex-col info-pop"
                                        v-if="chatContent.stat!.eval_count">
                                        <div>
                                            <span>eval count: </span>{{ chatContent.stat!.eval_count }}
                                        </div>
                                        <div>
                                            <span>model: </span>{{ chatContent.stat!.model }}
                                        </div>
                                        <div>
                                            <span>created at: </span>
                                            {{ isoToLocalDateTime(chatContent.stat!.created_at as string) }}
                                        </div>
                                        <div>
                                            <span>total duration: </span>
                                            {{ fixedStrNum(chatContent.stat!.total_duration as string) }}s
                                        </div>
                                        <div>
                                            <span>load duration: </span>
                                            {{ fixedStrNum(chatContent.stat!.load_duration as string) }}ms
                                        </div>
                                        <div>
                                            <span>prompt eval count: </span>
                                            {{ chatContent.stat!.prompt_eval_count }}
                                        </div>
                                        <div>
                                            <span>prompt eval duration: </span>
                                            {{ fixedStrNum(chatContent.stat!.prompt_eval_duration as string) }}ms
                                        </div>
                                        <div>
                                            <span>eval duration: </span>
                                            {{ fixedStrNum(chatContent.stat!.eval_duration as string) }}s
                                        </div>
                                    </div>
                                    <div v-else>{{ $t("暂无信息") }}</div>
                                </NTooltip>
                                <NTooltip>
                                    <template #trigger>
                                        <span class="tool-item" @click="answerAgain(key.replace(/^\d+--/, ''))"><i
                                                class="i-common:refresh w-20 h-20"></i></span>
                                    </template>
                                    {{ $t("重新生成") }}
                                </NTooltip>
                            </div>
                        </div>
                    </div>
                </template>
            </NScrollbar>
        </div>
    </div>

    <div class="search-tools-wrapper">
        <div class="search-tools ">
            <div class="tools">
                <NInput :placeholder="$t('请输入对话内容')" class="input-token" type="textarea" v-model:value="questionContent"
                    :autosize="{
                        minRows: 3,
                        maxRows: 15
                    }" @keydown.enter="sendChartToModelForKeyBoard" />

                <NButton class="send-btn" type="primary" v-if="!isInChat" @click="sendChatToModel"
                    :disabled="questionContent.trim() ? false : true">{{ $t("发送") }}</NButton>
                <NButton class="send-btn" type="error" v-else @click="stopGenerate">{{ $t("停止生成") }}</NButton>
            </div>
        </div>
    </div>
    <!-- 模型管理弹窗 -->
    <Settings />
    <!-- 分享弹窗 -->
    <Share />
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { NImage, NInput, NScrollbar, NTooltip, NButton, NSpin } from 'naive-ui';
import { message } from "@/utils/naive-tools"
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

import MarkdownRender from './MarkdownRender.vue';
import useIndexStore from '../store';
import { storeToRefs } from 'pinia';
import { sendChat, stopGenerate } from '../controller';
import Settings from './Settings.vue';
import { useClipboard } from '@vueuse/core'
import { eventBUS } from '../utils/tools';
import { isoToLocalDateTime, fixedStrNum } from "@/utils/tools"
import { useI18n } from 'vue-i18n';
import Share from "./Share.vue"
const { t: $t } = useI18n()
const logos: any = {
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
/**
 * @description 根据模型确定对应的图标
 */
const answerLogo = (model: string) => {
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

const scrollRef = ref()
const contentWrapper = ref()
const indexStore = useIndexStore()
const { questionContent, currentModel, chatHistory, userScrollSelf, scrollTop, isInChat, themeColors, themeMode } = storeToRefs(indexStore)

/********** question-token和question-edit切换 **********/
const questionEditContent = ref("")
const questionEditCOntentForSend = ref("")

/**
 * @description 复制已有提问
 */
const { copy } = useClipboard({ source: "" })
async function copyQuestion(text: string) {
    await copy(text)
    message.success($t("复制成功"))
}


/**
 * @description 复制回答内容
 */
async function copyContent(text: string) {
    await copy(text.replace(/<div class="thought-placeholder">(.*?)<\/div>/gs, ""))
    message.success($t("复制成功"))
}

/**
 * @description 发送对话内容到模型
 */
function sendChatToModel() {
    if (!questionContent.value.trim()) return

    if (!currentModel.value) {
        message.warning($t("请选择对应模型"))
        return
    }
    isInChat.value = true
    userScrollSelf.value = false
    // 將聊天加入到对话历史
    const formatQuestionContent = questionContent.value.replace(/\n/g, '<br>')
    chatHistory.value.set(formatQuestionContent, { content: "", stat: { model: currentModel.value } })
    nextTick(() => moveFn(10))
    sendChat({
        user_content: formatQuestionContent,
    })
    questionContent.value = ""
}

/**
 * @description 键盘发送
 */
function sendChartToModelForKeyBoard(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatToModel()
    }
}

/**
 * @description 重新回答
 */
function answerAgain(questionContent: string) {
    if (isInChat.value) {
        message.warning($t("当前正在回答，请稍后"))
    } else {
        isInChat.value = true
        chatHistory.value.set(questionContent, { content: "", stat: { model: currentModel.value } })
        sendChat({
            user_content: questionContent,
        })
    }

}

/**
 * @description 滚动条
 */
function scrollMove() {
    let timer: any = null
    return (delay: number) => {
        if (!timer) {
            const scrollWrapper = document.querySelector(".n-scrollbar-content") as HTMLDivElement
            timer = setTimeout(() => {
                if (userScrollSelf.value) return
                if (scrollRef.value) {
                    scrollRef.value.scrollTo({
                        top: scrollWrapper.offsetHeight,
                        behavior: "instant"
                    })
                    clearTimeout(timer)
                }
                timer = null
            }, delay)
        }
    }
}

const moveFn = scrollMove()
// 监听滚动
eventBUS.$on("doScroll", () => moveFn(100))

/**
 * @description 滚动回调:用来记录当前滚动的高度，便于判断是否用户手动停止滚动
 *  */
function scrollCallback(e: any) {
    if (scrollTop.value < e.target.scrollTop) {
        userScrollSelf.value = false
    } else {
        userScrollSelf.value = true
    }
    scrollTop.value = e.target.scrollTop
}

/**
 * @description 根据主题切换背景色
 */
const questionToolBg = computed(() => {
    if (themeMode.value == "light") {
        return themeColors.value.questionToolBgLight
    } else {
        return themeColors.value.questionToolBgDark
    }
})
</script>

<style scoped lang="scss">
@mixin tools {
    height: 40px;
    visibility: hidden;
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;

    .tool-item {
        cursor: pointer;
        display: flex;
        padding: 4px;
        transition: .2s;
        border-radius: 4px;

        &:hover {
            background: #f5f5f5;
        }
    }
}

@mixin tools-visible {
    &:hover {
        .tools {
            visibility: visible;
        }
    }
}

.content-wrapper {
    display: grid;
    grid-template-rows: calc(100% - 130px);
    row-gap: 20px;
    height: 100%;

    .chat-window {
        width: 70%;
        margin: var(--bt-mg-large) auto 0;
        position: relative;

        .question {
            width: 100%;
            /* display: grid;
            grid-template-columns: 1fr 30% 30px;
            column-gap: 10px;
            justify-content: end; */
            display: flex;
            justify-content: flex-start;
            gap: 10px;
            margin: var(--bt-mg-normal) 0 50px 0;
            font-size: 16px;


            .question-token {
                // background-color: #F5F5F5;
                box-sizing: border-box;
                border-radius: 5px;
                display: flex;
                padding: 4px var(--bt-pd-small);
                align-items: center
            }

            .tools {
                @include tools();
                align-items: flex-start;
                justify-content: flex-end;
                margin-top: 9px
            }

            @include tools-visible();

        }

        .question-edit {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--bt-pd-small);
            margin: var(--bt-mg-normal) 10px var(--bt-mg-normal) 0;

            .operation-btns {
                display: flex;
                justify-content: flex-end;
                gap: var(--bt-pd-small);
            }
        }

        .answer {
            width: 100%;
            display: grid;
            grid-template-columns: 30px 80%;
            column-gap: 10px;
            justify-content: start;

            .answer-token {
                box-sizing: border-box;
                border-radius: 5px;
                padding: 4px var(--bt-pd-normal) 30px 0;
                position: relative;

                .info-pop {
                    gap: 10px;
                    color: #909090;
                }

                .tools {
                    margin-top: var(--bt-mg-large);
                    width: 100%;
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    @include tools()
                }

                @include tools-visible()
            }
        }


    }


}

.search-tools-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;

    .search-tools {
        width: 100%;
        display: flex;
        justify-content: center;

        .tools {
            width: 100%;
            position: relative;
            background-color: v-bind(questionToolBg);

            .input-token {
                padding-bottom: 40px;
            }

            .send-btn {
                position: absolute;
                right: 8px;
                bottom: 8px;
            }
        }
    }
}
</style>