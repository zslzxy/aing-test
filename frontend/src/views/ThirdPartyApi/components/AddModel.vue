<template>
    <n-modal :show="addSupplierModel">
        <n-card :title="isEditModelFormData ? $t('修改模型') : $t('添加模型')" class="add-model-wrapper">
            <n-form :model="addModelFormData" :rules="addModelRules" ref="addModelForm">
                <n-form-item :label="$t('模型ID')" path="modelName">
                    <n-input :placeholder="$t('请输入模型ID')" v-model:value="addModelFormData.modelName"
                        :on-update:value="modelIdChange" :disabled="isEditModelFormData" />
                </n-form-item>
                <n-form-item :label="$t('模型别名')" path="title">
                    <n-input :placeholder="$t('请输入模型别名')" v-model:value="addModelFormData.title" />
                </n-form-item>
                <n-form-item :label="$t('模型功能')" path="capability">
                    <n-select :options="capabilityOptions" multiple v-model:value="addModelFormData.capability"
                        :on-update:value="capabilityChange" />
                </n-form-item>
            </n-form>
            <template #footer>
                <div class="action-wrapper">
                    <n-button @click="closeAddModel">{{ $t('取消') }}</n-button>
                    <n-button type="primary" @click="confirmAddModel">{{ isEditModelFormData ? $t('确认') : $t('添加')
                        }}</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getThirdPartyApiStoreData } from '../store'
import {
    capabilityChange,
    confirmAddModel,
    modelIdChange,
    closeAddModel,
} from "../controller"
const { t: $t } = useI18n()
const {
    addSupplierModel,
    addModelFormData,
    addModelRules,
    isEditModelFormData,
    capabilityOptions,
    addModelForm
} = getThirdPartyApiStoreData()
</script>

<style scoped lang="scss">
@use "@/assets/base";

.add-model-wrapper {
    width: 480px;

    .action-wrapper {
        @include base.action-wrapper;
    }
}
</style>