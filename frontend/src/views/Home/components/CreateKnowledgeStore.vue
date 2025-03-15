<template>
    <NForm label-placement="top" class="mt-20" :model="createKnowledgeFormData" :rules="rules"
        ref="createKnowledgeModelRef">
        <NFormItem :label="$t('名称')" path="ragName">
            <NInput :placeholder="$t('请输入知识库名称')" v-model:value="createKnowledgeFormData.ragName"
                :disabled="disabledKey == 'ragName'" />
        </NFormItem>
        <NFormItem :label="$t('描述')" path="ragDesc">
            <NInput :placeholder="$t('请输入知识库描述')" v-model:value="createKnowledgeFormData.ragDesc" type="textarea"
                :disabled="disabledKey == 'ragDesc'" />
        </NFormItem>
        <NFormItem :label="$t('嵌入模型')" path="enbeddingModel">
            <NSelect :placeholder="$t('选择模型')" v-model:value="createKnowledgeFormData.enbeddingModel"
                :options="embeddingModelsList" label-field="title" value-field="model" @update:value="doSelectModel" />
        </NFormItem>
    </NForm>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput, NSelect } from "naive-ui"
import { storeToRefs } from "pinia";
import useIndexStore from "../store";
import { ref, watch } from "vue";
import i18n from "@/lang";
const $t = i18n.global.t
defineProps<{ disabledKey?: string }>()
const { createKnowledgeFormData, createKnowledgeModelRef, embeddingModelsList } = storeToRefs(useIndexStore())
const rules = ref({
    ragName: [{ required: true, message: $t('请输入知识库名称'), trigger: 'blur' }],
    ragDesc: [{ required: true, message: $t('请输入知识库描述'), trigger: 'blur' }],
    enbeddingModel: [{ required: true, message: $t('请选择嵌入模型'), trigger: 'blur' }],
})
const placeKey = ref("")

/**
 * @description 选择模型回调 
 */
function doSelectModel(_: any, option: any) {
    createKnowledgeFormData.value.supplierName = option.supplierName
}

watch(() => createKnowledgeFormData.value.ragName, (val) => {
    createKnowledgeFormData.value.ragDesc = val
})
</script>

<style scoped></style>