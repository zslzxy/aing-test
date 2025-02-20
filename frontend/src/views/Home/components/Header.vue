<template>
    <div class="header-wrapper">
        <div class="comunication-tit flex justify-between items-center">
            <div class="flex items-center"><i class="i-common:expand w-22 h-22 mr-10 cursor-pointer" v-if="isFold"
                    @click="doExpand"></i></div>
            {{ currentChatTitle }}
        </div>
        <div class="right-tools">
            <NButton type="success" @click="shareShow = true">
                <template #icon><i class="i-common:share w-16 h-16"></i></template>
                {{ $t("分享") }}
            </NButton>
            <NSelect :options="modelList" style="width: 260px;" v-model:value="currentModel">
                <template #empty>
                    <span class="color-#C2C2C2">{{ $t("点击[设置]安装模型") }}</span>
                </template>
            </NSelect>
            <NPopselect :options="languageOptions" scrollable v-model:value="currentLanguage"
                :on-update:value="changeLanguage">
                <div class="flex justify-end gap-1.25 items-center cursor-pointer">
                    <span>{{ currentLnaguageLabel }}</span><i class="i-common:language w-20 h-20"></i>
                </div>
            </NPopselect>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { NSelect, NPopselect, NButton } from "naive-ui";
import { get_model_list, setServiceLanguage,createShare } from "../controller";
import useIndexStore from "../store";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { setLang } from "@/lang"
const { t: $t } = useI18n()
const indexStore = useIndexStore()
const { modelList, currentModel, isFold, siderWidth, currentChatTitle, languageOptions, currentLanguage ,shareShow} = storeToRefs(indexStore)

/**
 * @description 获取模型列表
 */
get_model_list()

/**
 * @descript 打开侧边栏
 */
function doExpand() {
    siderWidth.value = 280
    isFold.value = false
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
 * @description 设置当前语言
 */
function changeLanguage(val: string) {
    setLang(val as any)
    currentLanguage.value = val
    setServiceLanguage(val)
}



</script>

<style lang="scss">
.header-wrapper {
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .comunication-tit {
        font-size: 18px;
        // font-weight: bold;
    }

    .right-tools {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        // min-width: 360px;
    }
}
</style>