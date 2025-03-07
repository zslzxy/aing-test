<template>
    <!-- 联网搜索 -->
    <NCollapse v-if="searchResult && searchResult.length">
        <NCollapseItem :title="$t('共参考{0}份资料', [searchResult.length])">
            <NList>
                <NListItem v-for="(item, index) in searchResult" :key="item.link">
                    <NTooltip trigger="hover">
                        <template #trigger>
                            <div>
                                [{{ index + 1 }}] <NButton text @click="jumpThroughLink(item.link)">{{
                                    item.title ? item.title : item.link }}</NButton>
                            </div>
                            <!-- <NTag style="width: 40px;display: inline-flex;justify-content: center;align-items: center;margin-right: 10px;" type="success">{{ index + 1 }}</NTag> <NButton text @click="jumpThroughLink(item.link)">{{ item.title?item.title:item.link }}</NButton> -->
                        </template>
                        {{ item.link }}
                    </NTooltip>
                </NListItem>
            </NList>
        </NCollapseItem>
    </NCollapse>
    <NDivider v-if="searchResult && searchResult.length" />
    <ThinkWrapper
        :content="content.match(/<think>([\s\S]*?)(?:<\/think>|$)/) ? content.match(/<think>([\s\S]*?)(?:<\/think>|$)/)![1] : ''"
        v-if="content.match(/<think>([\s\S]*?)(?:<\/think>|$)/)" />
    <div ref="markdownRef" class="markdown-content" v-html="answerContent"></div>
</template>

<script setup lang="tsx">
import { computed, nextTick, onMounted, onUpdated, ref, watch, } from 'vue';
import markdownit from 'markdown-it'
import hljs from 'highlight.js';
import { NCollapseItem, NCollapse, NList, NListItem, NDivider, NButton, NTag, NTooltip } from "naive-ui"
import useIndexStore from '../store';
import { storeToRefs } from 'pinia';
import { useClipboard } from '@vueuse/core'
import { message } from '@/utils/naive-tools.tsx';
import ThinkWrapper from './ThinkWrapper.vue';
import { eventBUS } from '../utils/tools.tsx';
import { useI18n } from 'vue-i18n';
import mk from "@vscode/markdown-it-katex"
const { t: $t } = useI18n()
const { questionContent, themeColors, themeMode, currentLanguage } = storeToRefs(useIndexStore())
const { copy: copyFn } = useClipboard({ source: "" })
const props = defineProps<{ content: string, searchResult?: Array<{ content: string, link: string, title: string }> }>()
const answerContent = ref("")
const markdownRef = ref<HTMLElement | null>()
const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
    langPrefix: 'language-',
    highlight(str, lang): string {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str, true).value
            } catch (__) { }
        }

        return str;
    }
})
md.use(mk,{
    throwOnError: false,
})

md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const lang = token.info || '';
    const code = token.content;
    const highlightedCode = options.highlight!(code, lang, "");
    // console.log(self.rules.math_block(token,code))
    const toolbarPlaceholder = `<div class="tool-header" data-lang="${lang}"><div class="tool-header-tit">${lang}</div><div class="tool-placeholder"><div class="tool-wrapper"><span class="tool-copy" data-code="${encodeURIComponent(code)}">${$t("复制")}</span><span class="tool-reference" data-code="${encodeURIComponent(code)}">${$t("引用")}</span></div></div></div>`;
    return `<pre class="hljs"><div class="hljs-wrapper">${toolbarPlaceholder}<code${lang ? ` class="${lang} code-block"` : ''}>${highlightedCode}</code></div></pre>`
};

// TODO:目前不确定AI返回的latex公式是否正确，参考Latex和Katex的规范，先全面使用$$...$$代替
function replaceLatexMathDelimiters(text:string) {
    // 替换块级公式：\[...\] → $$...$$
    text = text.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
    // 替换行内公式：\(...\) → $$...$$
    text = text.replace(/\\\(/g, '$$').replace(/\\\)/g, '$$');
    // 替换公式环境：\begin{xxx}...\end{xxx} → $$...$$
    text = text.replace(/\\begin\{(\w+)\}/g, '$$').replace(/\\end\{(\w+)\}/g, '$$');
    
    return text;
}

watch(() => props.content, () => {
    const res = md.render(props.content.replace(/<think>([\s\S]*?)(?:<\/think>|$)/, ""))  // 正文渲染时取消think部分
    answerContent.value = replaceLatexMathDelimiters(res);
}, { immediate: true })


/**
 * @description markdown渲染结束后立即进行工具、思考等处理过程
 */
function dealThinkAndTools() {
    let timer: any = null
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
                                copyFn(decodeURIComponent((copyBtn as HTMLSpanElement).dataset.code as string))
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


// 在生命周期中处理think和工具
const mountedDeal = dealThinkAndTools()
onMounted(mountedDeal)

onUpdated(() => {
    nextTick(() => {
        mountedDeal()
        // 执行滚动
        eventBUS.$emit("doScroll")
    })
})


// 根据主题计算当前应用的颜色模式
const themeMarkdownBg = computed(() => {
    if (themeMode.value == "light") {
        return {
            code: themeColors.value.markdownCodeLight,
            tool: themeColors.value.markdownToolsLight,
            fontColor: themeColors.value.markdownToolsFontColorLight
        }
    } else {
        return {
            code: themeColors.value.markdownCOdeDark,
            tool: themeColors.value.markdownToolsDark,
            fontColor: themeColors.value.markdownToolsFontColorDark
        }
    }
})

// 监听当前语言变化
watch(currentLanguage, val => {
    const copySpanList = document.querySelectorAll(".tool-copy")
    copySpanList.forEach((span) => {
        (span as HTMLSpanElement).innerText = $t("复制")
    })
    const referenceSpanList = document.querySelectorAll(".tool-reference")
    referenceSpanList.forEach(span => {
        (span as HTMLSpanElement).innerText = $t("引用")
    })
})

/**
 * @description 跳转到对应目标页
 */
function jumpThroughLink(link: string) {
    // window.location.href = link
    window.open(link)
}
</script>

<style lang="scss">
@import 'katex/dist/katex.min.css';

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

.markdown-content {
    // font-size: 16px;

    p {
        margin-block-end: 1em;
    }

    ul {
        padding-inline-start: 40px;
        margin: var(--bt-mg-small);

        li {
            list-style: initial;
        }
    }

    ol {
        li {
            list-style: initial;
        }
    }

    .hljs-wrapper {
        overflow-x: auto;
        background-color: v-bind("themeMarkdownBg.code");
        padding: 40px var(--bt-pd-normal) 0;
        position: relative;

        .tool-header {
            height: 40px;
            width: 100%;
            background-color: v-bind("themeMarkdownBg.tool");
            position: absolute;
            left: 0;
            top: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .tool-header-tit {
                padding-left: var(--bt-pd-normal);
            }

            .tool-list {
                height: 40px;
                min-width: 300px;
            }
        }

        .top-tools {
            width: 100%;
            height: 40px;
            background-color: #ff3300;
        }

        .hljs {
            background-color: v-bind("themeMarkdownBg.code");
            padding: var(--bt-pd-normal);

            code {
                display: inline-block;
                width: 100%;
                background-color: transparent;
                padding: 0;
            }
        }

        .code-block {
            width: 100%;
            box-sizing: border-box;
            overflow-x: auto;
            display: inline-block;
        }
    }

    code {
        // background-color: #F9FAFB;
        background-color: transparent;
        padding: 3px;
    }



    blockquote {
        background-color: #F5F5F5;
        padding: 2px 0 2px 5px;
        margin: var(--bt-mg-small) 0 0 0;

        p {
            margin: 0;
        }
    }
}

.hljs {
    background-color: transparent !important;
    color: v-bind("themeMarkdownBg.fontColor") !important;
}
</style>