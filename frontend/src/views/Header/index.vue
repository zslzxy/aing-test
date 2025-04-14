<template>
    <div class="header-wrapper" v-if="!activeKnowledge || (siderWidth == 0 && knowledgeSiderWidth == 0)">
        <div class="comunication-tit flex justify-between items-center">
            <div class="flex items-center">
                <i class="i-common:expand w-18 h-18 mr-10 cursor-pointer" v-if="isFold" @click="doExpand"></i>
            </div>
            <n-popover trigger="click" placement="bottom-start" v-model:show="modelListShow">
                <template #trigger>
                    <div class="flex justify-start items-center gap-2.5 cursor-pointer" @click="modelListShow = true">
                        <span>{{ showModel }}</span>
                        <div class="choosed-model-handle">
                            <i class="i-tdesign:chevron-down w-20 h-20"></i>
                        </div>
                    </div>
                </template>
                <ModelList />
                <!-- <i class="i-ci:add-plus w-18 h-18"></i> 添加多模型按钮，暂时隐藏 -->
            </n-popover>
        </div>
        <div class="right-tools">
            <n-button type="success" @click="shareShow = true">
                <template #icon><i class="i-common:share w-16 h-16"></i></template>
                {{ $t("分享") }}
            </n-button>
        </div>
    </div>
    <!-- 模型选择列表 -->

</template>

<script lang="tsx" setup>
import ModelList from "./components/ModelList.vue";
import { get_model_list, } from "@/views/Settings/controller"
import { doExpand } from "@/views/Header/controller"
import { useI18n } from "vue-i18n";
import { getHeaderStoreData } from "./store";
import { getSiderStoreData } from "../Sider/store";
import { getKnowledgeStoreData } from "../KnowleadgeStore/store";

const { t: $t } = useI18n()
const { shareShow, showModel,modelListShow } = getHeaderStoreData()
const { isFold, siderWidth, } = getSiderStoreData()
const { activeKnowledge, knowledgeSiderWidth, } = getKnowledgeStoreData()

/**
 * @description 获取模型列表
 */
get_model_list()




</script>

<style lang="scss" scoped>
@use "@/assets/base.scss";

.header-wrapper {
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .choosed-model-handle {
        @include base.row-flex-between;
        gap: 0;
        cursor: pointer;
        justify-content: flex-start;
    }

    .right-tools {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        // min-width: 360px;
    }
}

.model-list-drop {
    max-height: 300px;
}
</style>