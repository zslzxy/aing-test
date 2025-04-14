<template>
    <div class="tit">
        <div class="flex justify-start items-center">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <i class="i-ci:circle-warning w-18 h-18 cursor-pointer"
                        @click="jumpToHelp(currentChooseApi!.help)"></i>
                </template>
                {{ $t("使用教程") }}
            </n-tooltip>
            <span class="ml-5 mr-5">{{ currentChooseApi!.supplierTitle }}</span>
        </div>
        <div class="flex justify-end items-center">
            <n-switch style="margin-right:20px" size="small" v-model:value="currentChooseApi!.status"
                @update:value="(val: any) => changeCurrentSupplierStatus(currentChooseApi?.supplierName!, val)">
            </n-switch>
            <n-tooltip trigger="hover" v-if="!currentChooseApi!.home">
                <template #trigger>
                    <i class="i-weui:delete-outlined w-20 h-20 cursor-pointer  mr-10"
                        @click="delSupplier(currentChooseApi!.supplierName)"></i>
                </template>
                {{ $t("删除服务商") }}
            </n-tooltip>
        </div>
    </div>
    <div class="config-item">
        <div class="item-tit">
            {{ $t("API密钥") }}
        </div>
        <div class="config-form">
            <n-input-group>
                <n-input :placeholder="$t('请输入API密钥')" v-model:value="applierServiceConfig.apiKey" />
                <n-button @click="checkConfig">{{ $t("检查") }}</n-button>
            </n-input-group>
            <n-button type="info" text style="font-size: 12px;margin-top: 3px;"
                @click="getKey(currentChooseApi!.home)">{{
                    $t("点次获取密钥") }}
            </n-button>
        </div>
    </div>
    <div class="config-item">
        <div class="item-tit">
            {{ $t("API地址") }}
        </div>
        <div class="config-form">
            <n-input-group>
                <n-input :placeholder="$t('请输入API地址')" v-model:value="applierServiceConfig.baseUrl" />
            </n-input-group>
            <div style="font-size: 12px;color: rgb(177.3, 179.4, 183.6);margin-top: 3px;">
                <span>{{ $t("示例") }}: </span>
                <span>{{ currentChooseApi!.baseUrlExample }}</span>
            </div>
        </div>
    </div>
    <div class="config-item">
        <n-button type="primary" @click="saveConfig">{{ $t("保存API") }}</n-button>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getThirdPartyApiStoreData } from '../store'
import {
    changeCurrentSupplierStatus,
    jumpToHelp,
    delSupplier,
    getKey,
    checkConfig,
    saveConfig,
} from "../controller"
const { t: $t } = useI18n()
const {
    currentChooseApi,
    applierServiceConfig,
} = getThirdPartyApiStoreData()
</script>

<style scoped lang="scss">
@use "@/assets/base";
.tit {
    font-weight: bold;
    @include base.row-flex-between;
    border-bottom: 1px solid rgb(221.7, 222.6, 224.4);
    padding-bottom: 15px;
}

.config-item {
    margin-top: 10px;

    .item-tit {
        margin-bottom: 5px;
    }
}
</style>