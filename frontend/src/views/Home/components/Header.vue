<template>
    <div class="header-wrapper" v-if="!activeKnowledge">
        <div class="comunication-tit flex justify-between items-center">
            <div class="flex items-center">
                <i class="i-common:expand w-18 h-18 mr-10 cursor-pointer" v-if="isFold" @click="doExpand"></i>
            </div>
            <NDropdown trigger="hover" :options="modelList" @select="changeCurrentModel" key-field="value">
                <NButton icon-placement="right">
                    {{ currentModel }}
                    <template #icon>
                        <i class="i-proicons:arrow-swap w-18 h-18 ml-5"></i>
                    </template>
                </NButton>
            </NDropdown>
        </div>
        <div class="right-tools">
            <NButton type="success" @click="shareShow = true">
                <template #icon><i class="i-common:share w-16 h-16"></i></template>
                {{ $t("分享") }}
            </NButton>


        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { NSelect, NPopselect, NButton, NInputGroup, NDropdown } from "naive-ui";
import { get_model_list, setServiceLanguage, createShare } from "../controller";
import useIndexStore from "../store";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n()
const indexStore = useIndexStore()
const { modelList, currentModel, isFold, siderWidth, currentChatTitle, languageOptions, currentLanguage, shareShow,activeKnowledge } = storeToRefs(indexStore)

/**
 * @description 获取模型列表
 */
get_model_list()

/**
 * @descript 打开侧边栏
 */
function doExpand() {
    siderWidth.value = 220
    isFold.value = false
}



/**
 * @description 切换模型
 */
function changeCurrentModel(model: string) {
    console.log(model)
    currentModel.value = model
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