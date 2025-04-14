<template>
    <WelcomeContent v-if="chatHistory.size == 0 && guideActive && !currentChatAgent" />
    <div class="answer" style="margin-bottom: 20px;"
        v-else-if="(chatHistory.size == 0 && !guideActive) || currentChatAgent">
        <div v-if="currentChatAgent" class="w-30 h-30 text-24px">{{ currentChatAgent.icon ? currentChatAgent.icon :"😀" }}</div>
        <NImage :src="AingDesk" width="30" height="30" preview-disabled v-else />
        <div class="answer-token">
            <p style="line-height: 30px;">{{ currentChatAgent ? currentChatAgent.prompt : $t("让我们开启一段新的对话吧") }}</p>
        </div>
    </div>
</template>


<script setup lang="ts">
import { NImage } from "naive-ui";
import AingDesk from "@/assets/images/logo.png";
import WelcomeContent from "./components/WelcomeContent.vue";
import { getChatContentStoreData } from "../ChatContent/store";
import { getAgentStoreData } from "../Agent/store";
const {
    chatHistory,
    guideActive
} = getChatContentStoreData()
const {
    currentChatAgent,
} = getAgentStoreData()
</script>


<style lang="scss" scoped>
@use "@/assets/base";

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
            @include base.tools()
        }

        @include base.tools-visible()
    }
}

.answer-token {
    box-sizing: border-box;
    border-radius: 5px;
    position: relative;
}
</style>