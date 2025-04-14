<template>
    <div class="answer" style="margin-bottom: 20px;">
        <div class="w-30 h-30 text-26px">
            <n-image :src="AingDesk" width="30" height="30" preview-disabled />
        </div>
        <div class="answer-token">
            <p>{{ $t("欢迎使用AingDesk，这是一款简单好用的AI助手，支持知识库、模型API、分享、联网搜索、智能体，此软件开源免费，也期待您分享软件给别人来支持我们的发展。") }}</p>
        </div>
    </div>
    <div class="answer" style="margin-bottom: 20px;">
        <div class="w-30 h-30 text-26px">
            <n-image :src="AingDesk" width="30" height="30" preview-disabled />
        </div>
        <div class="answer-token">
            <p>{{ $t("AingDesk是一个新的AI项目，它还在努力快速成长中，如果您在使用过程中遇到什么问题，或者您对软件有什么功能需求，可以加入我们微信群给我们进行反馈。") }}</p>
            <p class="flex flex-col justify-start items-start mt-20 w-200">
                <n-image :src="wechat" width="100px" />
            </p>
        </div>
    </div>
    <div class="answer" style="margin-bottom: 20px;">
        <div class="w-30 h-30 text-26px">
            <n-image :src="AingDesk" width="30" height="30" preview-disabled />
        </div>
        <div class="answer-token">
            <p>{{ $t("最后您可以给我们开源项目点星星，您的这点鼓励对我们继续迭代开源项目极其重要，感谢。") }}</p>
            <p class="mt-20">
                <n-button ghost @click="jumpToGithub">
                    <template #icon>
                        <i class="i-common:star w-20 h-20"></i>
                    </template>
                    {{ $t("去github点星星") }}
                </n-button>
            </p>
        </div>
    </div>

    <div class="answer" style="margin-bottom: 20px;">
        <div class="w-30 h-30 text-26px">
            <n-image :src="AingDesk" width="30" height="30" preview-disabled />
        </div>
        <div class="answer-token">
            <p>{{ $t("您可以在") }}{{ $t("设置") }}{{ $t("中关闭新手指引") }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import AingDesk from "@/assets/images/logo.png"
import wechat from "@/assets/images/wechat.png"
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n()

function jumpToGithub() {
    window.open("https://github.com/aingdesk/AingDesk")
}
</script>

<style scoped lang="scss">
.content-wrapper {
    display: grid;
    grid-template-rows: calc(100% - 170px);
    row-gap: 20px;
    height: 100%;

    .chat-window {
        width: calc(100% - 80px);
        margin: var(--bt-mg-large) auto 0;
        position: relative;

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
            }
        }
    }
}
</style>