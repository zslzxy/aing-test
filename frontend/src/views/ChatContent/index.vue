<template>
    <div class="content-wrapper" ref="contentWrapper" v-if="!activeKnowledge">
        <div class="chat-window" @mouseleave="mouseLeave">
            <n-scrollbar style="height: 100%;padding:0 var(--bt-pd-small)" ref="scrollRef"
                content-style="overflow: hidden;" :on-scroll="scrollCallback" id="scroll-bar">
                <!-- 新对话默认展示内容 -->
                <ChatWelcome />

                <template v-for="[key, chatContent] in chatHistory" :key="key">
                    <!-- 提问 -->
                    <Question :question-content="key" />
                    <!-- 回答 -->
                    <Answer :question-content="key" :answer-content="chatContent" />
                </template>
            </n-scrollbar>
        </div>
    </div>
    <!-- 对话工具栏 -->
    <ChatTools />

    <!-- 模型管理弹窗 -->
    <Settings />
    <!-- 分享弹窗 -->
    <Share />

    <!-- 文档预览 -->
    <div class="doc-content" v-if="activeKnowledge">
        <n-scrollbar>
            <MarkdownRender :content="docContent" />
        </n-scrollbar>
    </div>
</template>

<script setup lang="tsx">
import ChatWelcome from '@/views/ChatWelcome/index.vue';
import Question from "@/views/Question/index.vue"
import Answer from "@/views/Answer/index.vue"
import ChatTools from "@/views/ChatTools/index.vue"
import { getChatContentStoreData } from './store';
import { getKnowledgeStoreData } from '../KnowleadgeStore/store';
import { mouseLeave, scrollCallback,scrollMove } from "@/views/ChatContent/controller"

// 附件图标
import MarkdownRender from "@/views/Answer/components/MarkdownRender.vue"
import Share from "@/views/Header/components/Share.vue"
import Settings from '@/views/Settings/index.vue';
import { eventBUS } from '@/views/Home/utils/tools';
const moveFn = scrollMove()
const {
    chatHistory,
    scrollRef,
    contentWrapper
} = getChatContentStoreData()

const {
    activeKnowledge,
    docContent,
} = getKnowledgeStoreData()

// 监听滚动
eventBUS.$on("doScroll", () => moveFn(100))
</script>

<style scoped lang="scss">
@use "@/assets/base";


.content-wrapper {
    display: grid;
    grid-template-rows: calc(100% - 170px);
    row-gap: 20px;
    width: 100%;
    height: 100%;

    .chat-window {
        width: calc(100% - 80px);
        margin: var(--bt-mg-large) auto 0;
        position: relative;


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

    }


}



.doc-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
}
</style>