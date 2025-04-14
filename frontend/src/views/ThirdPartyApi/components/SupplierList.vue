<template>
    <div class="model-list">
        <n-list hoverable clickable>
            <n-scrollbar style="height:500px">
                <n-list-item v-for="item in thirdPartyApiServiceList" :key="item.supplierName"
                    :class="['cursor-pointer list-item', { active: item.supplierName == currentChooseApi?.supplierName }]"
                    @click="chooseApiService(item)">
                    <div class="flex justify-start items-center gap-1.25">
                        <n-image :src="item.icon" preview-disabled /><span>{{ item.supplierTitle }}</span>
                    </div>
                </n-list-item>
            </n-scrollbar>
        </n-list>
        <div class="add-supplier-btn mt-20">
            <n-button style="width:100%" ghost @click="addSupplierShow = true">{{ $t("添加模型服务商")
            }}</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getThirdPartyApiStoreData } from '../store'
import {
    chooseApiService
} from "../controller"
const {
    thirdPartyApiServiceList,
    currentChooseApi,
    addSupplierShow,
} = getThirdPartyApiStoreData()
const { t: $t } = useI18n()
</script>

<style scoped lang="scss">
@use "@/assets/base";
.model-list {
    border-right: 1px solid rgb(221.7, 222.6, 224.4);
    padding-right: 20px;

    .active {
        background-color: var(--bt-list-item-hover);
    }

    .list-item:hover {
        background-color: var(--bt-list-item-hover);
    }

}
</style>