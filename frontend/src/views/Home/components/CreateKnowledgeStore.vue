<template>
    <NForm label-placement="top" class="mt-20" :model="createKnowledgeFormData" :rules="rules"
        ref="createKnowledgeModelRef">
        <NFormItem label="名称" path="ragName">
            <NInput placeholder="请输入知识库名称" v-model:value="createKnowledgeFormData.ragName"
                @keydown.enter="createConfirm" :disabled="disabledKey == 'ragName'" />
        </NFormItem>
        <NFormItem label="描述" path="ragDesc">
            <NInput placeholder="请输入知识库描述" v-model:value="createKnowledgeFormData.ragDesc"
                @keydown.enter="createConfirm" type="textarea" :disabled="disabledKey == 'ragDesc'" />
        </NFormItem>
        <NFormItem label="嵌入模型">
            <NSelect placeholder="选择模型" v-model:value="placeKey" disabled />
        </NFormItem>
    </NForm>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput, NSelect } from "naive-ui"
import { storeToRefs } from "pinia";
import useIndexStore from "../store";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
defineProps<{ disabledKey?: string }>()
const { createKnowledgeFormData, createKnowledgeModelRef } = storeToRefs(useIndexStore())
const rules = ref({
    ragName: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }],
    ragDesc: [{ required: true, message: '请输入知识库描述', trigger: 'blur' }],
})
const placeKey = ref("bge-m3:latest")

/**
 * @description enter确认提交知识库创建 
 */
function createConfirm() {
    console.log(1111111)
}

watch(() => createKnowledgeFormData.value.ragName, (val) => {
    createKnowledgeFormData.value.ragDesc = val
})
</script>

<style scoped></style>