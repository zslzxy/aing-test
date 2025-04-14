<template>
    <n-modal v-model:show="modelDelLoading" :close-on-esc="false" :closable="false" :mask-closable="false">
        <n-card style="width:30%;max-width: 300px;">
            <div class="flex justify-center items-center flex-col">
                <div class="mb-20">{{ $t("模型刪除中，请稍后") }}</div>
                <n-spin size="medium" />
            </div>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { getSettingsStoreData } from '../store';
const { modelDelLoading } = getSettingsStoreData()
</script>

<style scoped></style>