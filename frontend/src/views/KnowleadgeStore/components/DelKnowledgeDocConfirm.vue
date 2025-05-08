<template>
    <n-modal :close-on-esc="false" :mask-closable="false" v-model:show="deleteKnowledgeDocShow" :title="$t('提示')"
        preset="card"  class="w-480px">
        <div class="flex items-center justify-center">
            <div class="box-border flex justify-center items-center gap-1.25">
                <i class="i-jam:alert-f w-24 h-24 text-[#E6A23C]"></i>
                <span>{{ $t('是否确认删除文档[ {0} ]？该操作不可逆', [deleteKnowledgeDoc!.doc_name]) }}</span>
            </div>
        </div>
        <template #footer>
            <div class="modal-footer-btns">
                <n-button @click="cancelDelKnowledgeDoc">{{ $t('取消') }}</n-button>
                <n-button @click="confirmDelKnowledgeDoc" type="primary">{{ $t('确认') }}</n-button>
            </div>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { cancelDelKnowledgeDoc, confirmDelKnowledgeDoc } from "../controller"
import { getKnowledgeStoreData } from '../store';
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n();
const {
    deleteKnowledgeDoc,
    deleteKnowledgeDocShow,
} = getKnowledgeStoreData();
</script>

<style scoped></style>