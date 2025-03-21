<template>
    <div class="content-wrapper" ref="contentWrapper" v-if="!activeKnowledge">
        <div class="chat-window" @mouseleave="mouseLeave">
            <NScrollbar style="height: 100%;padding:0 var(--bt-pd-small)" ref="scrollRef"
                content-style="overflow: hidden;" :on-scroll="scrollCallback" id="scroll-bar">
                <!-- 新对话默认展示内容 -->
                <!--  条件展示：v-if="chatHistory.size == 0" -->
                <div class="answer" style="margin-bottom: 20px;">
                    <div v-if="currentChatAgent" class="w-30 h-30 text-26px">{{ currentChatAgent.icon?currentChatAgent.icon:"😀" }}</div>
                    <NImage :src="AingDesk" width="30" height="30" preview-disabled v-else/>
                    <div class="answer-token">
                        <p>{{ currentChatAgent ? currentChatAgent.prompt : $t("让我们开启一段新的对话吧") }}</p>
                    </div>
                </div>

                <template v-for="[key, chatContent] in chatHistory" :key="key">
                    <!-- 提问 -->
                    <!-- <div class="question-edit" v-if="questionEditContent == key">
                        <NInput type="textarea" style="width: 60%;" v-model:value="questionEditCOntentForSend" />
                        <div class="operation-btns">
                        </div>
                    </div>  v-else-->

                    <div class="question">
                        <NImage :src="userImage" width="30" height="30" class="mt-6px" preview-disabled />
                        <!-- <div class="question-token" v-html="key.replace(/^\d+--/, '')"></div> -->
                        <div class="question-token-wrapper">
                            <div class="files" v-if="key.files?.length">
                                <div class="file-item cursor-pointer" v-for="(item, index) in key.files" :key="index"
                                    @click="openFile(item)">
                                    <NImage :src="pdf" width="40px" preview-disabled />
                                    <span class="show-tit">{{ getFileNameFromPath(item) }}</span>
                                </div>
                            </div>
                            <div class="images" v-if="key.images?.length">
                                <NImage :src="item" width="240px" v-for="item in key.images" :key="item" />
                            </div>
                            <div class="question-content">
                                <div class="question-token" v-html="key.content.replace(/^\d+--/, '')"></div>
                                <div class="tools">
                                    <NTooltip v-if="!key.files?.length && !key.files?.length">
                                        <template #trigger>
                                            <span class="tool-item"
                                                @click="copyQuestion(key.content.replace(/^\d+--/, ''))"><i
                                                    class="i-common:copy w-20 h-20"></i></span>
                                        </template>
                                        {{ $t("复制") }}
                                    </NTooltip>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- 回答 -->
                    <div class="answer">
                        <NImage :src="answerLogo(chatContent.stat!.model as string)" width="30" height="30"
                            preview-disabled />
                        <div class="answer-token flex items-center gap-5" v-if="!chatContent.content && isInChat">
                            <NSpin :size="20" />{{ targetNet ? $t("正在搜索...") : $t("正在思考...") }}
                        </div>
                        <div class="answer-token" v-else>
                            <MarkdownRender :content="chatContent.content"
                                :searchResult="chatContent.search_result as Array<any> ? chatContent.search_result as Array<any> : []" />
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
                                        <span class="tool-item" @click="answerAgain(key, chatContent.id as string)"><i
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

    <div class="search-tools-wrapper" v-if="!activeKnowledge">
        <div class="chat-mask" v-if="chatMask.status">
            <span>{{ chatMask.notice }}</span>
        </div>
        <div class="search-tools ">
            <div class="tools">
                <div class="upload-file-list" v-if="questionFiles.length">
                    <div class="file-item" v-for="(item, index) in questionFileList" :key="index">
                        <i class="i-tdesign:close-circle-filled w-18 h-18 cursor-pointer del-file text-red5"
                            @click="removeFile(index)"></i>
                        <NImage :src="pdf" width="40px" preview-disabled />
                        <NTooltip trigger="hover">
                            <template #trigger>
                                <span class="show-tit">{{ item }}</span>
                            </template>
                            <span>{{ item }}</span>
                        </NTooltip>
                    </div>
                </div>
                <div class="upload-file-list" v-if="questionImageList.length">
                    <div class="file-item" v-for="(item, index) in questionImageList" :key="index">
                        <i class="i-tdesign:close-circle-filled w-18 h-18 cursor-pointer del-file text-red5"
                            @click="removeImage(index)"></i>
                        <NImage :src="questionImages[index]" width="40px" />
                    </div>
                </div>
                <NInput :placeholder="$t('请输入对话内容')" class="input-token" type="textarea" v-model:value="questionContent"
                    :autosize="{
                        minRows: 3,
                        maxRows: 15
                    }" @keydown.enter="sendChartToModelForKeyBoard" />

                <div class="send-tools">
                    <NTooltip trigger="hover">
                        <template #trigger>
                            <NButton class="h-40" ghost :type="temp_chat ? 'primary' : 'default'" @click="useTempChat"
                                :focusable="false">
                                {{ $t("无记忆") }}
                                <template #icon>
                                    <i class="i-tdesign:brush"></i>
                                </template>
                            </NButton>
                        </template>
                        {{ $t(" 能提升单次回复质量，但大模型将没有上下文记忆") }}
                    </NTooltip>
                    <div>
                        <!-- :disabled="netActive" -->
                        <input type="file" style="display: none;" ref="questionFilesRef" @change="filesChange"
                            :accept="acceptFileType">
                        <NTooltip trigger="hover">
                            <template #trigger>
                                <NButton @click="chooseQuestionFiles" class="h-40">
                                    <template #icon>
                                        <i class="i-tdesign:attach"></i>
                                    </template>
                                    {{ $t("上传附件") }}
                                </NButton>
                            </template>
                            <!-- netActive ? $t("联网搜索暂不支持上传文件") : -->
                            {{ $t("支持上传文件、图片(最大不超过20MB), 支持PDF、DOC、TXT等格式") }}
                        </NTooltip>
                    </div>
                    <!-- 对话时选择知识库 -->
                    <NPopover trigger="click">
                        <template #trigger>
                            <NButton :type="activeKnowledgeForChat.length ? 'primary' : 'default'" ghost
                                style="height: 40px;" icon-placement="left" :focusable="false">
                                <template #icon>
                                    <i class="i-tdesign:folder"></i>
                                </template>
                                {{ $t("知识库") }}
                            </NButton>
                        </template>
                        <KnowledgeChoosePanel />
                    </NPopover>
                    <NButton class="h-40" ghost :type="netActive ? 'primary' : 'default'" @click="useSearchEngine"
                        :focusable="false">
                        <template #icon>
                            <i class="i-proicons:globe"></i>
                        </template>
                        {{ $t("联网搜索") }}
                    </NButton>
                    <NButton class="send-btn" type="primary" v-if="!isInChat" @click="sendChatToModel"
                        :disabled="questionContent.trim() ? false : true">{{ $t("发送") }}</NButton>
                    <NButton class="send-btn" type="error" v-else @click="stopGenerate">{{ $t("停止生成") }}</NButton>
                </div>
            </div>
        </div>
    </div>
    <!-- 模型管理弹窗 -->
    <Settings />
    <!-- 分享弹窗 -->
    <Share />

    <!-- 文档预览 -->
    <div class="doc-content" v-if="activeKnowledge">
        <NScrollbar>
            <MarkdownRender :content="docContent" />
        </NScrollbar>
    </div>
</template>

<script setup lang="tsx">
import { computed, defineComponent, h, nextTick, onMounted, ref, render, watch } from 'vue';
import { NImage, NInput, NScrollbar, NTooltip, NButton, NSpin, NUpload, NPopover, NBadge } from 'naive-ui';
import { message } from "@/utils/naive-tools"
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

// 附件图标
import pdf from "@/assets/images/PDF.png"

import MarkdownRender from './MarkdownRender.vue';


import KnowledgeChoosePanel from './KnowledgeChoosePanel.vue';
import useIndexStore, { type MultipeQuestionDto } from '../store';
import { storeToRefs } from 'pinia';
import { sendChat, stopGenerate } from '../controller';
import Settings from './Settings.vue';
import { useClipboard } from '@vueuse/core'
import { eventBUS } from '../utils/tools';
import { getFileNameFromPath } from "@/utils/tools"
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
 * @description 联网搜索配置数据
 */
const labels = ref({
    baidu: $t("百度"),
    "360": $t("360搜索"),
    sogou: $t("搜狗"),
})
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
const {
    questionContent,
    questionFiles,
    questionImages,
    currentModel,
    chatHistory,
    userScrollSelf,
    scrollTop,
    isInChat,
    themeColors,
    themeMode,
    targetNet,
    netActive,
    activeKnowledgeForChat,
    activeKnowledge,
    docContent,
    cuttentChatFileList,
    chatMask,
    temp_chat,
    currentChatAgent
} = storeToRefs(indexStore)


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
    // 拼接完整key
    const chatKey = {
        content: formatQuestionContent,
        files: questionFiles.value,
        images: questionImages.value
    }
    chatHistory.value.set(chatKey, { content: "", stat: { model: currentModel.value }, search_result: [] })
    nextTick(() => moveFn(10))
    sendChat({
        user_content: formatQuestionContent,
        images: questionImages.value.join(","),
        doc_files: questionFiles.value.join(",")
    })
    questionContent.value = ""
    questionFiles.value = []
    questionImages.value = []
    questionFileList.value = []
    questionImageList.value = []
    questionFilesCache.value = []
}

/**
 * @description 键盘发送
 */
function sendChartToModelForKeyBoard(event: KeyboardEvent) {
    if (isInChat.value) return
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatToModel()
    }
}

/**
 * @description 重新回答
 */
function answerAgain(question: MultipeQuestionDto, id: string) {
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

/**
 * @description 滚动条
 */
function scrollMove() {
    let timer: any = null
    return (delay: number) => {
        if (!timer) {
            timer = setTimeout(() => {
                const scrollWrapper = document.querySelector("#scroll-bar .n-scrollbar-content") as HTMLDivElement
                if (userScrollSelf.value) {
                    clearTimeout(timer)
                    timer = null
                    return
                }
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


/**
 * @description 鼠标离开
 *      - 鼠标离开chat-window后，如果当前正在对话，则开启滚动，滑动到最底部
 */
function mouseLeave() {
    userScrollSelf.value = false
    if (isInChat.value) {
        moveFn(100)
    }
}

/**
 * @description 是否启用联网搜索
 */
function useSearchEngine() {
    netActive.value = !netActive.value
}



/********** 上传附件处理 ***********/
// 文件上传限制
const fileLimit = [
    "docx",
    "doc",
    "xlsx",
    "xls",
    "csv",
    "pptx",
    "ppt",
    "pdf",
    "html",
    "htm",
    "md",
    "markdown",
    "txt",
    "log",
]

const imageLimit = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
]

const acceptFileType = [...fileLimit, ...imageLimit].reduce((p, v) => {
    return p + `.${v},`
}, "")
// 提问框展示的文件列表
const questionFileList = ref<any>([])
const questionImageList = ref<any>([])
// 文件域
const questionFilesRef = ref()
// 选择文件
function chooseQuestionFiles() {
    questionFilesRef.value.click()
}
// 文件缓存
const questionFilesCache = ref<File[]>([])
// 清除缓存中的指定文件
function removeFileFromeCache(fileName: string) {
    questionFilesCache.value = questionFilesCache.value.filter(item => item.name !== fileName)
}
// 计算文件缓存中所有文件大小总和与20mb的比较
function checkFileSize(file: File) {
    const totalSize = questionFilesCache.value.reduce((p, v) => {
        return p + v.size
    }, 0)
    if (totalSize + file.size > 20 * 1024 * 1024) {
        message.warning($t("附件总大小不能超过20MB"))
        return false
    }
    return true
}


/**
 * @description 上传附件：文件选择回调
 */
function filesChange() {
    const sizeCheck = checkFileSize(questionFilesRef.value.files[0])
    if (!sizeCheck) return
    const ext = questionFilesRef.value.files[0].name.split('.').pop()
    if (fileLimit.includes(ext)) {
        questionFileList.value.push(questionFilesRef.value.files[0].name)
        questionFiles.value.push(questionFilesRef.value.files[0].path)
        questionFilesCache.value.push(questionFilesRef.value.files[0])
    } else if (imageLimit.includes(ext)) {
        questionImageList.value.push(questionFilesRef.value.files[0].name)
        questionImages.value.push(questionFilesRef.value.files[0].path)
        questionFilesCache.value.push(questionFilesRef.value.files[0])
    }
    questionFilesRef.value.value = '';
}

/**
 * @description 删除上传的文件
 */
function removeFile(index: number) {
    const fileName = questionFileList.value.splice(index, 1)
    questionFiles.value.splice(index, 1)
    removeFileFromeCache(fileName[0])
    console.log(questionFilesCache.value)
}

/**
 * @description 删除上传的图片
 */
function removeImage(index: number) {
    const fileName = questionImageList.value.splice(index, 1)
    questionImages.value.splice(index, 1)
    removeFileFromeCache(fileName[0])
    console.log(questionFilesCache.value)
}

/**
 * @description 打开文件
 */
function openFile(filePath: string) {
    window.open(`file://${filePath}`)
}

/**
 * @description 打开临时对话
 */
function useTempChat() {
    temp_chat.value = !temp_chat.value
}



</script>

<style scoped lang="scss">
@use "@/assets/base";

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

@mixin file-item {
    box-sizing: border-box;
    padding: 10px;
    @include base.row-flex-between;
    justify-content: flex-start;
    gap: 5px;
    background: #fff;
    border-radius: 5px;
    position: relative;

    span.show-tit {
        @include base.single-line-ellipsis;
    }

    .del-file {
        position: absolute;
        right: -8px;
        top: -8px;
    }
}

.content-wrapper {
    display: grid;
    grid-template-rows: calc(100% - 170px);
    row-gap: 20px;
    height: 100%;

    .chat-window {
        width: calc(100% - 80px);
        margin: var(--bt-mg-large) auto 0;
        position: relative;

        .question {
            width: 100%;
            display: flex;
            justify-content: flex-start;
            gap: 10px;
            margin: 0px 0 30px 0;


            .question-token-wrapper {
                @include base.column-flex-center;
                align-items: flex-start;


                .files {
                    background-color: #F5F5F5;
                    box-sizing: border-box;
                    padding: 10px;
                    @include base.row-flex-between;
                    justify-content: flex-start;
                    flex-wrap: wrap;

                    .file-item {
                        @include file-item;
                    }
                }

                .images {
                    background-color: #F5F5F5;
                    box-sizing: border-box;
                    padding: 10px;
                    @include base.row-flex-between;
                    justify-content: flex-start;
                    flex-wrap: wrap;

                }

                .question-content {
                    @include base.row-flex-between;
                    justify-content: flex-start;

                    .question-token {
                        // background-color: #F5F5F5;
                        box-sizing: border-box;
                        border-radius: 5px;
                        display: flex;
                        padding: 4px var(--bt-pd-small);
                        align-items: center;
                    }

                    .tools {
                        @include tools();
                        align-items: flex-start;
                        justify-content: flex-end;
                        margin-top: 9px
                    }

                    @include tools-visible();
                }
            }





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
            grid-template-columns: 30px 1fr;
            column-gap: 10px;
            justify-content: start;

            .answer-token {
                box-sizing: border-box;
                border-radius: 5px;
                padding: 4px var(--bt-pd-normal) 20px 0;
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
            border-top: 1px solid rgb(224, 224, 230);

            :deep(.n-input) {
                --n-border: none !important;
            }

            .input-token {
                padding-bottom: 70px;
            }

            .send-tools {
                position: absolute;
                width: 100%;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                box-sizing: border-box;
                padding: 0 15px;
                left: 0px;
                bottom: 15px;

                .send-btn {
                    padding: 20px 40px;
                }

                .network-search {}

            }

        }
    }

    .chat-mask {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 20;
        @include base.row-flex-between;
        justify-content: center;
        color: #fff;
    }
}

.doc-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
}



.upload-file-list {
    box-sizing: border-box;
    padding: 10px;
    background: base.$gray-2;
    @include base.row-flex-between;
    justify-content: flex-start;

    .file-item {
        @include file-item;
    }
}
</style>