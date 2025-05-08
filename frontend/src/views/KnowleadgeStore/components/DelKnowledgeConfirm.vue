<template>
    <n-modal :close-on-esc="false" :mask-closable="false" :title="$t('提示')" v-model:show="deleteKnowledgeShow">
        <div class="flex items-center justify-center">
            <div class="box-border p-5 flex justify-center items-center gap-1.25 mt-20">
                <i class="i-jam:alert-f w-24 h-24 text-[#E6A23C]"></i>
                <span>{{ $t('是否确认删除知识库{0}及其下的所有文档？该操作不可逆', [deleteKnowledgeName]) }}</span>
            </div>
        </div>
        <templete #footer>
            <div class="modal-footer-btns">
                <n-button @click="cancelRemoveRagConfirm">{{ $t('取消') }}</n-button>
                <n-button @click="confirmRemoveRagConfirm" type="primary">{{ $t('确认') }}</n-button>
            </div>
        </templete>
    </n-modal>
</template>

<script setup lang="ts">
import { cancelRemoveRagConfirm, confirmRemoveRagConfirm } from "../controller"
import { getKnowledgeStoreData } from '../store';
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n();
const { deleteKnowledgeShow, deleteKnowledgeName } = getKnowledgeStoreData();
</script>

<style scoped></style>