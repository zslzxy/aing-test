<template>
    <div class="knowledge-choose-panel">
        <div class="header">
            <span class="header-tit"><i class="i-tdesign:folder w-18 h-18 text-[var(--bt-tit-color-secondary)]"></i>{{$t("选择知识库")  }}</span>
        </div>

        <n-scrollbar style="max-height:200px">
            <n-list hoverable clickable>
            <n-list-item v-for="item in knowledgeList" @click="chooseCurrent(item)" :class="{ disabled: !item.embeddingModelExist }">
                <div class="list-item">
                    <span>{{ item.ragName }}</span>
                    <i class="i-mynaui:check-circle-solid w-16 h-16 text-[#35ab69]" v-if="activeKnowledgeForChat?.includes(item.ragName)"></i>
                    <i class="i-mynaui:circle w-16 h-16" v-else></i>
                </div>
            </n-list-item>
        </n-list>
        </n-scrollbar>
    </div>
</template>

<script setup lang="ts">
import {chooseCurrent} from "@/views/KnowleadgeStore/controller"
import { getKnowledgeStoreData } from '../store';
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n();
const { knowledgeList, activeKnowledgeForChat } = getKnowledgeStoreData();
</script>

<style scoped lang="scss">
@use "@/assets/base";

.knowledge-choose-panel {
    width: 300px;
    min-height: 180px;
    .header {
        box-sizing: border-box;
        border-bottom: 1px solid #ececec;
        padding: 10px 0;

        .header-tit {
            @include base.row-flex-between;
            justify-content: flex-start;
        }
    }
}

.list-item {
    @include base.row-flex-between;
    padding-left: 8px;
}

:deep(.disabled) {
    cursor: not-allowed !important;
    color: base.$gray-4;
}

:deep(.n-list-item){
    padding:8px 20px !important;
}
</style>