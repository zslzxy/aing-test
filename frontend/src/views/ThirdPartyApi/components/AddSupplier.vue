<template>
    <n-modal :show="addSupplierShow">
        <n-card :title="$t('添加模型服务商')" class="add-supplier-wrapper">
            <n-form :model="addSupplierFormData" :rules="addSupplierFormRules" ref="addSupplierForm">
                <n-form-item :label="$t('供应商名称')" path="supplierTitle">
                    <n-input v-model:value="addSupplierFormData.supplierTitle" />
                </n-form-item>
                <n-form-item :label="$t('接口地址')" path="baseUrl">
                    <div class="w-100%">
                        <n-input v-model:value="addSupplierFormData.baseUrl" />
                        <span class="text-3 text-[#b1b3b8]  inline-block mt-3px">{{ $t('需要兼容openAI格式的接口') }}</span>
                    </div>
                </n-form-item>
                <n-form-item :label="$t('密钥')" path="apiKey">
                    <n-input v-model:value="addSupplierFormData.apiKey" />
                </n-form-item>
            </n-form>
            <template #footer>
                <div class="action-wrapper">
                    <n-button @click="cancelAddSupplier">{{ $t('取消') }}</n-button>
                    <n-button type="primary" @click="confirmAddSupplier">{{ $t('确认') }}</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getThirdPartyApiStoreData } from '../store'
import {
    confirmAddSupplier,
    cancelAddSupplier,
} from "../controller"
const {
		addSupplierShow,
		addSupplierForm,
    addSupplierFormData,
    addSupplierFormRules
} = getThirdPartyApiStoreData()
const { t: $t } = useI18n()
</script>

<style scoped lang="scss">
@use "@/assets/base";

.add-supplier-wrapper {
    width: 580px;

    .action-wrapper {
        @include base.action-wrapper;
    }
}
</style>