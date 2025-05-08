<template>
    <n-modal preset="card" :close-on-esc="false" :mask-closable="false" draggable :title="$t('请安装或接入嵌入模型')" v-model:show="installEmbeddingModelShow" class="w-460px" :closable="false">
        <div class="flex flex-col items-start justify-center gap-2.5 mt-20">
            <div class="w-100%">
                <span>{{ $t('请选择从Ollama安装-Embedding-安装bge-m3:latest') }}</span>
                <NButton type="primary" class="w-100%" @click="installBgeNow">
                    {{ $t('使用本地模型嵌入（推荐）') }}
                </NButton>
            </div>
            <div class="w-100%">
                <span>{{ $t('请选择接入第三方模型,接入支持Embedding三方API,如硅基流动') }}</span>
                <NButton type="primary" ghost class="w-100%" @click="doThird">
                    {{ $t('使用第三方API提供模型嵌入') }}
                </NButton>
            </div>
            <div class="flex justify-center w-100%">
                <span class="cursor-pointer underline text-green-5" @click="localModelTutorial">
                    {{ $t('查看知识库教程') }}
                </span>
            </div>
        </div>
    </n-modal>
</template>

<script setup lang="ts">
import { getKnowledgeStoreData } from "../store";
import { localModelTutorial,installBgeNow,doThird } from "../controller"
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n();
const {installEmbeddingModelShow} = getKnowledgeStoreData()
</script>

<style scoped></style>