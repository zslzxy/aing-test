<template>
    <NCard class="mb-20" segmented>
        <template #header>
            <div class="flex justify-between items-center gap-1.25">
                <span class="text-14px">mermaid</span>
                <div class="flex justify-end gap-1.25">
                    <NButtonGroup>
                        <NButton type="primary" ghost size="small" @click="doCopy">{{ $t("复制") }}</NButton>
                        <NButton type="primary" ghost size="small" @click="showImg">{{ $t("图形") }}</NButton>
                        <NButton type="primary" ghost size="small" @click="showSvg = false">{{ $t("源码") }}</NButton>
                    </NButtonGroup>
                </div>
            </div>
        </template>
        <!-- 图形 -->
        <div ref="svgWrapper" v-show="showSvg" class="flex justify-center"></div>
        <!-- 源码 -->
        <div class="mt-20" v-show="!showSvg">
            <pre>{{ props.maidContent }}</pre>
        </div>
    </NCard>
</template>

<script setup lang="ts">
import { NCard, NButton, NButtonGroup } from 'naive-ui';
import mermaid from 'mermaid';
import { nextTick, ref } from 'vue';
import { useClipboard } from '@vueuse/core';
import { message } from '@/utils/naive-tools';
import { useI18n } from 'vue-i18n';
import i18n from '@/lang';
const $t = i18n.global.t;
const svgWrapper = ref<HTMLElement>()
const props = defineProps<{ maidContent: string, id: string }>()
const showSvg = ref(false)
const { copy: copyFn } = useClipboard({ source: "" })

/**
 * @description 渲染svg
 */
async function renderSvg() {
    mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
    });
    mermaid.parseError = function (err, hash) {
        console.warn(err)
        const errList = document.querySelectorAll('div[id^="dmermaid-svg-"]')
        for(let item of errList){
            item.remove()
        }
    }
    const mermaidRenderDiv = svgWrapper.value!
    try {
        const res = await mermaid.render(props.id, props.maidContent)
        const divTemp = document.createElement("div")
        divTemp.innerHTML = res.svg
        const svg = divTemp.querySelector("svg")
        mermaidRenderDiv.appendChild(svg as Node)
    } catch (error) {
        console.warn(error)
        mermaidRenderDiv.innerText = $t("mermaid解析失败,请检查语法")
       
    }
}

/**
 * @description 渲染svg图形
 */
function showImg() {
    showSvg.value = true
    nextTick(() => {
        renderSvg()
    })
}

/**
 * @description 复制
 */
function doCopy() {
    copyFn(props.maidContent)
    message.success("复制成功")
}
</script>

<style scoped lang="scss">
@use "@/assets/base";

:deep(.n-card-header) {
    background: base.$gray-2;
    padding-top: 10px;
    padding-bottom: 10px
}
</style>