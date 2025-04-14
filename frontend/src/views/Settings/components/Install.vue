<template>
    <NModal v-model:show="installShow" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard :title="downloadText" style="width: 40%;max-width: 536px;">
            <NProgress :percentage="modelInstallProgress.progress" indicator-placement="inside" processing />
            <div class="flex mt-20 justify-start gap-10 items-center">
                <span>{{ $t("模型大小:") }} {{ getByteUnit(modelInstallProgress.total, true) }}</span>
                <span>{{ $t("已下载:") }} {{ getByteUnit(modelInstallProgress.completed, true) }}</span>
                <span class="flex">
                    <span>{{ $t("速度:") }} {{ getByteUnit(modelInstallProgress.speed, true) }}/s</span>
                    <span class="cursor-pointer ml-6 flex items-center" @click="reconnect_model_download">
                        <NTooltip trigger="hover">
                            <template #trigger>
                                <i class="i-common:refresh w-16 h-16"></i>
                            </template>
                            {{ $t("尝试重新选择下载节点，以优化下载速度，PS:不会丢失当前下载进度，将自动断点续传。") }}
                        </NTooltip>
                    </span>
                </span>
            </div>
        </NCard>
    </NModal>
</template>

<script setup lang="ts">
import { NModal, NCard, NProgress, NTooltip } from 'naive-ui';
import { getByteUnit } from "@/utils/tools"
import { reconnect_model_download } from "@/views/Settings/controller"
import { useI18n } from 'vue-i18n';
import { getSettingsStoreData } from '@/views/Settings/store';
const { t: $t } = useI18n()
const { modelInstallProgress, installShow, downloadText } = getSettingsStoreData()

</script>

<style scoped lang="scss">
@mixin tools {
    height: 40px;
    visibility: hidden;
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;

    .tool-item {
        cursor: pointer;
        display: flex;
        padding: 4px;
        transition: .2s;
        border-radius: 4px;

        &:hover {
            background: #f5f5f5;
        }
    }
}
</style>