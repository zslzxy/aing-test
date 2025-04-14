<template>
    <n-modal v-model:show="optimizeKnowledgeShow" :close-on-esc="false" :closable="false" :mask-closable="false">
        <n-card style="width:30%;max-width: 500px;">
            <div class="flex justify-center items-center gap-2.5">
                <n-spin size="small" />
                <div>{{ $t("正在优化知识库,这可能需要几分钟到十几分钟......") }}</div>
            </div>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import {getKnowledgeStoreData} from "../store"
const { optimizeKnowledgeShow } = getKnowledgeStoreData()
</script>

<style scoped></style>