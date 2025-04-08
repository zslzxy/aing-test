<template>
    <div class="advanced-settings">
        <div class="general">
            <NForm :model="sliceChunkFormData" :rules="rules" ref="sliceFormRef">
                <NFormItem :label="$t('分段标识符')">
                    <!-- <NDynamicTags v-model:value="sliceChunkFormData.separators" /> -->
                    <div class="flex-col w-100% items-center">
                        <NRadioGroup v-model:value="customSeparators">
                            <NRadio :value="false">自动</NRadio>
                            <NRadio :value="true">自定义</NRadio>
                        </NRadioGroup>
                        <NInput style="margin-top:10px" :placeholder="$t('请输入分隔符')"
                            v-model:value="sliceChunkFormData.separators[0]" v-if="customSeparators" />
                    </div>
                </NFormItem>
                <NFormItem :label="$t('分段最大长度')" path="chunkSize">
                    <NInputNumber v-model:value="sliceChunkFormData.chunkSize" />
                </NFormItem>
                <NFormItem :label="$t('分段重叠长度')" path="overlapSize">
                    <NInputNumber v-model:value="sliceChunkFormData.overlapSize" />
                </NFormItem>
            </NForm>

            <ul class="desc">
                <li>{{ $t("分段标识符支持函正则表达式，如") }}/(words.{1,10}\s)/,{{ $t("正则表达式无需添加修饰符，默认会自动添加g修饰符") }}</li>
                <li>{{ $t("分段重叠长度建议为分段最大长度的10%到20%") }}</li>
            </ul>
        </div>
        <div class="priview">
            <div>
                <NInputGroup>
                    <NSelect :placeholder="$t('选择文档进行预览')" :options="testChunkFile"
                        v-model:value="sliceChunkFormData.filename" />
                    <NButton type="info" @click="doPreview">{{ $t("预览") }}</NButton>
                </NInputGroup>
            </div>
            <div class="preview-list">
                <NScrollbar style="height:100%">
                    <NAlert type="info" :show-icon="false" v-for="(item, index) in slicePreviewList" class="mb-10px">{{
                        item }}
                    </NAlert>
                </NScrollbar>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { NInput, NInputNumber, NDivider, NForm, NFormItem, NSelect, NInputGroup, NButton, NDynamicTags, NTooltip, NAlert, NScrollbar, NCheckbox, NRadioGroup, NRadio } from "naive-ui"
import { useI18n } from "vue-i18n";
import {
    getIndexStore,
    doPreview
} from "../controller";
const { t: $t } = useI18n()
const {
    chooseList,
    sliceChunkFormData,
    sliceFormRef,
    slicePreviewList,
    customSeparators
} = getIndexStore()
// 已选的文件下拉列表
const testChunkFile = computed(() => {
    return chooseList.value.map((item: any) => {
        return {
            label: item.name,
            value: item.path,
        }
    })
})

// 分片规则表单校验规则
const rules = ref({
    chunkSize: [{
        validator(_: any, value: any) {
            if (value) {
                if (value < 20) {
                    return new Error($t("分段最大长度不能小于20"));
                } else if (value > 1000) {
                    return new Error($t("分段最大长度不能大于1000"));
                } else {
                    return true
                }
            } else {
                return new Error($t("请填写分段最大长度"));
            }
        }, trigger: "blur"
    }],
    overlapSize: [{
        validator(_: any, value: any) {
            if (value) {
                if (value < 0) {
                    return new Error($t("分段重叠长度不能小于0"));
                } else if (value > sliceChunkFormData.value.chunkSize) {
                    return new Error($t("分段重叠长度不能大于分段最大长度"));
                } else {
                    return true;
                }
            } else {
                if (value == 0) {
                    return true
                } else {
                    return new Error($t("请填写分段重叠长度"));
                }
            }
        }, trigger: "blur"
    }],
    separators: [{
        // validator(_: any, value: any) {
        //     if (!customSeparators.value) {
        //         return true
        //     } else {
        //         if (sliceChunkFormData.value.separators[0]) {
        //             return true
        //         } else {
        //             return new Error($t("请填写分段标识符"))
        //         }
        //     }
        // }, trigger: "blur"
    }],
})

</script>

<style scoped lang="scss">
@use "@/assets/base";

.advanced-settings {
    display: grid;
    grid-template-columns: 180px 1fr;

    .general {
        @include base.column-flex-center;
        align-items: flex-start;
        justify-content: flex-start;
        border-right: 1px solid base.$gray-4;
        box-sizing: border-box;
        padding-right: 20px;

        .desc {
            color: base.$gray-6;
            font-size: 12px;

            li {
                margin-bottom: 10px;
                list-style: disc !important;
            }
        }

        .attention {
            font-size: 12px;
            color: base.$gray-6;
        }

        .separators-arr {
            @include base.column-flex-center;
            align-items: flex-start;

            .add-new-separators {
                @include base.row-flex-between;
                justify-content: flex-start;
                font-size: 12px;
                gap: 5px;
                cursor: pointer
            }

            .input-list {
                @include base.column-flex-center;
                align-items: flex-start;
                gap: 5px;
            }
        }
    }

    .priview {
        box-sizing: border-box;
        padding: 0 20px;

        .preview-list {
            margin-top: 20px;
            height: 400px;
        }
    }
}
</style>