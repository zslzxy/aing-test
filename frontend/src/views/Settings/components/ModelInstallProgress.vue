<template>
    <n-modal v-model:show="modelManagerInstallProgresShow" :close-on-esc="false" :closable="false"
        :mask-closable="false">
        <n-card :title='modelManagerInstallNotice' style="width: 40%;max-width: 560px; min-width: 500px;">
            <n-progress :percentage="modelManagerInstallProgress.progress" indicator-placement="inside" processing />
            <div class="flex mt-20 justify-start gap-10 items-center">
                <span>{{ $t("大小:") }} {{ getByteUnit(modelManagerInstallProgress.total, true) }}</span>
                <span>{{ $t("已下载:") }} {{ getByteUnit(modelManagerInstallProgress.completed, true) }}</span>
                <span class="flex">
                    <span>
                        {{ $t("速度:") }} {{ getByteUnit(modelManagerInstallProgress.speed, true) }}
                    </span>
                    <span class="cursor-pointer ml-6 flex items-center" @click="reconnect_model_download">
                        <n-tooltip trigger="hover">
                            <template #trigger>
                                <i class="i-common:refresh w-16 h-16"></i>
                            </template>
                            {{ $t("尝试重新选择下载节点，以优化下载速度，PS:不会丢失当前下载进度，将自动断点续传。") }}
                        </n-tooltip>
                    </span>
                </span>
            </div>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { getByteUnit } from "@/utils/tools"
import { getSettingsStoreData } from '../store';
import { reconnect_model_download } from "@/views/Settings/controller"
const { modelManagerInstallProgresShow, modelManagerInstallNotice, modelManagerInstallProgress } = getSettingsStoreData()
</script>

<style scoped></style>