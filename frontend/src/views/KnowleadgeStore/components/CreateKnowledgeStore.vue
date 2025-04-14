<template>
    <n-form label-placement="top" class="mt-20" :model="createKnowledgeFormData" :rules="rules"
        ref="createKnowledgeModelRef">
        <n-form-item :label="$t('名称')" path="ragName">
            <n-input :placeholder="$t('请输入知识库名称')" v-model:value="createKnowledgeFormData.ragName"
                :disabled="disabledKey == 'ragName'" />
        </n-form-item>
        <n-form-item :label="$t('描述')" path="ragDesc">
            <n-input :placeholder="$t('请输入知识库描述')" v-model:value="createKnowledgeFormData.ragDesc" type="textarea"
                :disabled="disabledKey == 'ragDesc'" />
        </n-form-item>
        <n-form-item :label="$t('嵌入模型')" path="enbeddingModel">
            <n-select :placeholder="$t('选择模型')" v-model:value="createKnowledgeFormData.enbeddingModel"
                :options="embeddingModelsList" label-field="title" value-field="model" @update:value="doSelectModel"
                :disabled="isEditKnowledge" />
        </n-form-item>
        <n-form-item>
            <template #label>
                <div class="flex justify-start gap-1.25">
                    <span class="w-180">{{ $t('最大召回数量') }}(topK)</span>
                </div>
            </template>
            <template #default>
                <div class="w-100% flex flex-col items-start">
                    <n-slider :min="1" :max="20" :step="1" v-model:value="createKnowledgeFormData.maxRecall"
                        :marks="{ 1: '1', 20: '20' }" />
                    <div>
                        <span class="text-3 text-gray-4">{{ $t("检索知识库时的最大返回条数，建议：本地模型3条，线上模型5条") }}</span>
                    </div>
                </div>
            </template>
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { doSelectModel } from "@/views/KnowleadgeStore/controller"
import { getKnowledgeStoreData } from "../store";
import i18n from "@/lang";
const $t = i18n.global.t
defineProps<{ disabledKey?: string }>()
const {
    createKnowledgeFormData,
    createKnowledgeModelRef,
    embeddingModelsList,
    isEditKnowledge
} = getKnowledgeStoreData()
const rules = ref({
    ragName: [{ required: true, message: $t('请输入知识库名称'), trigger: 'blur' }],
    ragDesc: [{ required: true, message: $t('请输入知识库描述'), trigger: 'blur' }],
    enbeddingModel: [{ required: true, message: $t('请选择嵌入模型'), trigger: 'blur' }],
})
const placeKey = ref("")



watch(() => createKnowledgeFormData.value.ragName, (val) => {
    createKnowledgeFormData.value.ragDesc = val
})
</script>

<style scoped></style>