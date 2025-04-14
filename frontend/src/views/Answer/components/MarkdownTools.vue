<template>
    <div class="tool-wrapper">
        <span v-if="copied">{{ $t("已复制") }}</span>
        <span @click="copyCode" v-else>{{ $t("复制") }}</span>
        <span @click="referenceAnswer">{{ $t("引用") }}</span>
    </div>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { message } from '@/utils/naive-tools';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
const {t:$t} = useI18n()
const props = defineProps<{ codeContent: string }>()
const source = ref(props.codeContent)
const { copy, copied, } = useClipboard({ source })
/**
 * @description 复制代码
 */
function copyCode() {
    source.value = props.codeContent
    copy(source.value)
    message.success("复制成功")
}

/**
 * @description 引用回答内容
 */
function referenceAnswer() {
    // answerCodeContent.value = props.codeContent
}
</script>

<style  lang="scss">
.tool-wrapper {
    padding: 0 var(--bt-pd-normal) 0 0;
    height: 40px;
    display: flex;
    gap: var(--bt-mg-small);
    justify-content: flex-end;
    align-items: center;

    span {
        cursor: pointer;
    }
}
</style>