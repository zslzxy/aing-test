<template>
    <!-- 第三方api配置界面 -->
    <n-modal :show="thirdPartyApiShow" preset="dialog" style="width: 740px;" :title="$t('第三方API配置')" :show-icon="false">
        <template #close>
            <i class="i-tdesign:close-circle w-20 h-20 cursor-pointer text-[#909399]"
                @click="thirdPartyApiShow = false"></i>
        </template>
        <div class="api-config-wrapper" :segmented="{ content: true, footer: true }">
            <div class="api-config-content">
                <!-- 服务商列表 -->
                <SupplierList />
                <!-- 配置面板 -->
                <div class="config-panel" v-if="currentChooseApi">
                    <!-- 上方配置区域 -->
                    <ConfigurTop />

                    <div class="config-model-list">
                        <div class="tit">
                            <div>
                                {{ $t("模型") }}
                                <span style="color: rgb(177.3, 179.4, 183.6);font-size: 12px;font-weight: normal;">{{
                                    $t('默认从/models获取所有模型') }}</span>
                            </div>
                            <div>
                                {{ $t("开关所有") }}
                                <n-switch size="small" v-model:value="isAllModelEnable"
                                    @update:value="multipleModelStatusChange">
                                </n-switch>
                            </div>
                        </div>
                        <div class="add-model">
                            <n-button size="small" text @click="addSupplierModel = true">
                                <template #icon>
                                    <i class="i-proicons:add-circle w-18 h-18"></i>
                                </template>
                                {{ $t(("添加模型")) }}
                            </n-button>
                        </div>
                        <!-- 模型列表 -->
                        <SupplierModelList />
                    </div>
                </div>
            </div>
        </div>
    </n-modal>

    <!-- 添加模型 -->
    <AddModel />

    <!-- 添加模型服务商 -->
    <AddSupplier />
</template>

<script setup lang="tsx">
import AddSupplier from './components/AddSupplier.vue';
import AddModel from './components/AddModel.vue';
import SupplierModelList from './components/SupplierModelList.vue';
import SupplierList from './components/SupplierList.vue';
import ConfigurTop from './components/ConfigurTop.vue';
import { getThirdPartyApiStoreData } from './store';
import {
    getSupplierList,
    multipleModelStatusChange,
} from "./controller"
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n()

const {
    thirdPartyApiShow,
    currentChooseApi,
    addSupplierModel,
    isAllModelEnable,
} = getThirdPartyApiStoreData()

// 获取服务商列表
getSupplierList()
</script>

<style scoped lang="scss">
@use "@/assets/base";

.api-config-wrapper {
    width: 680px;
    height: 560px;
    overflow: hidden;

    .api-config-content {
        height: 560px;
        display: grid;
        grid-template-columns: 220px 1fr;

        .config-panel {
            padding-left: 20px;

            .config-model-list {
                margin-top: 20px;

                .tit {
                    @include base.row-flex-between;
                    margin-bottom: 10px;
                    padding-right: 20px;
                }

                

                :deep(.n-list-item) {
                    padding-left: 5px
                }


                .add-model {
                    @include base.row-flex-between;
                    justify-content: flex-start;
                }
            }
        }
    }
}

</style>