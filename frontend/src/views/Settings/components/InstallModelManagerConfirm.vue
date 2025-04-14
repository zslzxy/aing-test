<template>
    <n-modal v-model:show="managerInstallConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <n-card style="width:45%;max-width: 560px; min-width: 500px;" :title='$t("提示")'>
            <div class="flex justify-start items-center">
                <div class="mb-20">{{ $t("检测到您没有安装模型管理器，是否立即安装？") }}</div>
            </div>
            <n-form label-placement="left" label-width="100px">
                <n-form-item :label="$t('模型管理器')" path="manager">
                    <n-select :options="managerList" v-model:value="managerForInstall" />
                </n-form-item>
                <n-form-item :label="$t('模型存储位置')" path="model_path">
                    <n-popover>
                        <template #trigger>
                            <n-button @click="chooseOllamaPath" class="position-choose">{{ modelManagerInstallPath ?
                                modelManagerInstallPath : $t("选择")
                                }}
                            </n-button>
                        </template>
                        {{ modelManagerInstallPath? modelManagerInstallPath : $t("请选择模型管理器的安装路径") }}
                    </n-popover>
                </n-form-item>
            </n-form>
            <div class="flex justify-end gap-5 mt-50">
                <n-button type="default" @click="doNotInstallModelManagerNow">{{ $t("暂不安装") }}</n-button>
                <n-button type="success" @click="installModelManager">{{ $t("立即安装") }}</n-button>
            </div>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { getSettingsStoreData } from '../store';
import { chooseOllamaPath, doNotInstallModelManagerNow, installModelManager } from "@/views/Settings/controller"

const { managerInstallConfirm, managerForInstall, modelManagerInstallPath } = getSettingsStoreData()
const managerList = ref([
    { label: "ollama", value: "ollama" }
])
</script>

<style scoped lang="scss">
@use "@/assets/base";

.position-choose {
    max-width: 100%;
    @include base.single-line-ellipsis;
}
</style>