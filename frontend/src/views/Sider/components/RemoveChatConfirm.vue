<template>
    <n-modal v-model:show="chatRemoveConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <n-card :title='$t("删除对话")' style="width: 45%;max-width: 460px;">
            <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="chatRemoveConfirm = false"></i>
            </template>
            {{ $t("是否确认删除当前对话") }}
            <div class="modal-footer">
                <n-button type="default" ghost @click="chatRemoveConfirm = false">{{ $t("取消") }}</n-button>
                <n-button type="error" ghost @click="removeChat(contextIdForDel)">{{ $t("删除") }}</n-button>
            </div>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { removeChat } from "../controller"
import { getSiderStoreData } from '../store';
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n()
const {
    chatRemoveConfirm,
    contextIdForDel,
} = getSiderStoreData()
</script>

<style scoped lang="scss">
@use "@/assets/base";

.modal-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    gap: 20px;
}
</style>