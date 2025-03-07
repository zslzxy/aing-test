<template>
    <div class="knowledge-choose-panel">
        <div class="header mb-10">
            <span class="header-tit"><i class="i-tdesign:folder w-18 h-18 text-[var(--bt-tit-color-secondary)]"></i>选择知识库</span>
        </div>

        <NList hoverable clickable>
            <NListItem v-for="item in knowledgeList" @click="chooseCurrent(item)">
                <div class="list-item">
                    <i class="i-mynaui:check-circle-solid w-16 h-16 text-[#35ab69]" v-if="activeKnowledgeForChat?.includes(item.ragName)"></i>
                    <i class="i-mynaui:circle w-16 h-16" v-else></i>
                    <span>{{ item.ragName }}</span>
                </div>
            </NListItem>
        </NList>
    </div>
</template>

<script setup lang="ts">
import { NList, NListItem } from 'naive-ui';
import { storeToRefs } from 'pinia';
import useIndexStore from '../store';
const { knowledgeList, activeKnowledgeForChat } = storeToRefs(useIndexStore());

/***
 * @description 选择当前知识库
 */
function chooseCurrent(item: any) {
    if (activeKnowledgeForChat.value?.includes(item.ragName)) {
        activeKnowledgeForChat.value = activeKnowledgeForChat.value.filter((i: string) => i !== item.ragName)
    } else {
        activeKnowledgeForChat.value?.push(item.ragName)
    }
}
</script>

<style scoped lang="scss">
@use "@/assets/base";

.knowledge-choose-panel {
    width: 600px;
    min-height: 380px;
    max-height: 530px;
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
    justify-content: flex-start;
}
</style>