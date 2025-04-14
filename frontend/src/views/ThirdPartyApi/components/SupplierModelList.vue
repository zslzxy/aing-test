<template>
    <n-list hoverable>
        <n-scrollbar style="height: 200px;">
            <n-list-item v-for="item in supplierModelList" :key="item.modelName" v-if="supplierModelList.length">
                <div class="model-item">
										<div class="flex items-center justify-start gap-1.25">
												<span>{{ item.title }}</span>
												<n-tooltip trigger="hover">
														<template #trigger>
																<i class="i-proicons:text-edit-style w-16 h-16 mr-20 cursor-pointer"
																		@click="handleModelDataChange(item)"></i>
														</template>
														{{ $t("修改模型") }}
												</n-tooltip>
												<n-tag v-for="_item in item.capability" size="small">{{ _item }}</n-tag>
										</div>
                    <div class="operation">
                        <n-switch size="small" v-model:value="item.status"
                            @update:value="(val: any) => modelStatusChange(item.modelName, val)">
                        </n-switch>
                        <i class="i-weui:delete-outlined w-20 h-20 cursor-pointer hover:text-red-5"
                            @click="delModel(item.modelName)"></i>
                    </div>
                </div>
            </n-list-item>
            <div v-else>{{ $t("当前服务商下属暂无模型可用") }}</div>
        </n-scrollbar>
    </n-list>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getThirdPartyApiStoreData } from '../store'
import {
		modelStatusChange,
		handleModelDataChange,
    delModel,
} from "../controller"
const { t: $t } = useI18n()
const {
		supplierModelList,
    currentModelNameForEdiit,
    modelTitTemp,
} = getThirdPartyApiStoreData()
</script>

<style scoped lang="scss">
@use "@/assets/base";

.model-item {
    @include base.row-flex-between;

    .operation {
        @include base.row-flex-between;
        justify-content: flex-end;
    }
}
</style>