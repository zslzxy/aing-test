<template>
    <n-modal v-model:show="modelDelConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <n-card style="width:45%;max-width: 560px; min-width: 500px;" :title='$t("提示")'>
            <div class="flex justify-start items-center">
                <div class="mb-20">{{ $t("是否确认删除模型，该操作不可逆？") }}</div>
            </div>
            <div class="flex justify-end gap-5 mt-20">
                <n-button type="default" @click="cancelRemoveModel">{{ $t("取消") }}</n-button>
                <n-button type="error" @click="doRemoveModel">{{ $t("删除") }}</n-button>
            </div>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { cancelRemoveModel, doRemoveModel } from "@/views/Settings/controller"
import { getSettingsStoreData } from '../store';
const { modelDelConfirm } = getSettingsStoreData()

</script>

<style scoped></style>