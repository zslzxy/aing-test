<template>
    <n-modal v-model:show="chatModifyConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <n-card :title='$t("修改对话标题")' style="width: 45%;max-width: 460px;">
            <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="chatModifyConfirm = false"></i>
            </template>
            <n-input v-model:value="newChatTitle" :placeholder='$t("请输入新的对话标题")'
                @keydown.enter="modifyChatTitle({ context_id: contextIdForModify, title: newChatTitle })" />
            <div class="modal-footer">
                <n-button type="default" ghost @click="chatModifyConfirm = false">{{ $t("取消") }}</n-button>
                <n-button type="success" ghost
                    @click="modifyChatTitle({ context_id: contextIdForModify, title: newChatTitle })">{{
                        $t("确认") }}
                </n-button>
            </div>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { getSiderStoreData } from "../store";
import { modifyChatTitle } from "@/views/Sider/controller"
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n()
const { contextIdForModify, chatModifyConfirm, newChatTitle, } = getSiderStoreData()
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