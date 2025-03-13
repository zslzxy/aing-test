<template>
    <div class="settings-wrapper">
        <NList>
            <NListItem>
                <div class="theme-setting w-100%">
                    <div class="flex-between">
                        <span>{{ themeMode == 'light' ? $t("浅色模式") : $t("深色模式") }} </span>
                        <NSwitch size="small" active-color="#000" checked-value="dark" unchecked-value="light"
                            v-model:value="themeMode" :on-update:value="changeThemeMode"></NSwitch>
                    </div>
                </div>
            </NListItem>
            <NListItem>
                <!-- <div class="language-setting w-100% flex-between">
                    <span>{{ currentLnaguageLabel }} </span>
                    <NPopselect :options="languageOptions" scrollable v-model:value="currentLanguage"
                        :on-update:value="changeLanguage">
                        <i class="i-common:language w-20 h-20 cursor-pointer"></i>
                    </NPopselect>
                </div> -->
                <div class="language-setting w-100% flex-between">
                    <span>{{ $t("语言选择") }} </span>
                    <NSelect :options="languageOptions" v-model:value="currentLanguage"
                        :on-update:value="changeLanguage" style="width:120px"></NSelect>
                </div>
            </NListItem>
            <NListItem>
                <div class="search-through-net flex-between">
                    <div>
                        {{ $t("默认搜索引擎") }}
                    </div>
                    <NSelect :options='[
                        { label: $t("不联网"), value: "" },
                        { label: $t("百度"), value: "baidu" },
                        { label: $t("搜狗"), value: "sogou" },
                        { label: $t("360搜索"), value: "360" },
                    ]' style="width:120px" v-model:value="targetNet" />
                </div>
            </NListItem>
            <NListItem>
                <div class="flex justify-between items-center">
                    <span>Github</span>
                    <NButtonGroup>
                        <NButton @click="toStar">
                            <template #icon>
                                <i class="i-common:star w-20 h-20"></i>
                            </template>
                            star
                        </NButton>

                        <NButton @click="toIssue">
                            <template #icon>
                                <i class="i-common:issues w-20 h-20"></i>
                            </template>
                            反馈
                        </NButton>
                    </NButtonGroup>
                </div>
            </NListItem>
            <NListItem>
                <div class="flex justify-center flex-col items-center gap-2.5">
                    <span>{{ $t("加入AingDesk交流群") }}</span>
                    <NImage :src="wechat" width="100px" />
                </div>
            </NListItem>
            <NListItem>
                <div class="flex justify-center gap-2.5 text-[#5c5c5c]">
                    <span>{{ $t("当前版本") }}: v{{ version }}</span>
                    <span @click="jumpToTutorial" class="underline text-green-6 cursor-pointer">{{ $t("文档教程") }}</span>
                </div>
            </NListItem>
        </NList>
    </div>
</template>

<script setup lang="ts">
import { NSwitch, NPopselect, NList, NListItem, NSelect, NImage, NAlert, NButton, NButtonGroup } from "naive-ui"
import Storage from "@/utils/storage"
import useIndexStore, { type ChatItemInfo } from "../store";
import { storeToRefs } from "pinia";
import { setLang } from "@/lang"
import { setServiceLanguage, } from "../controller";
import { computed, ref } from "vue";
import { eventBUS } from "../utils/tools";
import i18n from "@/lang";
import wechat from "@/assets/images/wechat.png"
const $t = i18n.global.t
const {
    themeMode,
    languageOptions,
    currentLanguage,
    targetNet,
    version
} = storeToRefs(useIndexStore())
// 搜索引擎列表
const labels = ref({
    baidu: $t("百度"),
    "360": $t("360搜索"),
    sogou: $t("搜狗"),
})

/**
 * @description 切换主题
 */
function changeThemeMode(val: string) {
    themeMode.value = val
    Storage.themeMode = val
    eventBUS.$emit("themeChange", val)
}



/**
 * @description 设置当前语言
 */
function changeLanguage(val: string) {
    setLang(val as any)
    currentLanguage.value = val
    setServiceLanguage(val)
}

/**
 * @description 计算当前展示的语言
 */
const currentLnaguageLabel = computed(() => {
    return languageOptions.value.reduce((p: any, v: any) => {
        if (currentLanguage.value == v.value) {
            return v.label
        } else {
            return p
        }
    }, "")
})

/**
 * @descriiption github相关跳转
 */
function toStar() {
    window.open("https://github.com/aingdesk/AingDesk")
}

function toIssue() {
    window.open("https://github.com/aingdesk/AingDesk/issues")
}

/**
 * @description 跳转教程
 */
function jumpToTutorial(){
    window.open("https://docs.aingdesk.com/zh-Hans/")
}
</script>

<style scoped lang="scss">
@use "@/assets/base";

.flex-between {
    width: 100%;
    @include base.row-flex-between;
}

.settings-wrapper {


    .theme-setting {}
}
</style>