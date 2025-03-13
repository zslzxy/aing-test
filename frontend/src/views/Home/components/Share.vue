<template>
    <NModal v-model:show="shareShow" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard :title="$t('将AingDesk分享给好友一起使用')" style="width: 760px;">
            <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="closeShare"></i>
            </template>
            <div>
                <div class="inline-info">
                    <!-- <span class="item-label">{{ $t("对话") }}:</span> -->
                    <NForm inline>
                        <NFormItem>
                            <NInput style="width:150px" v-model:value="title" :placeholder="$t('请输入名称')" />
                        </NFormItem>
                        <NFormItem>
                            <NSelect :options="knowledgeList" label-field="ragName" value-field="ragName"
                                v-model:value="knowledges" multiple :ellipsis-tag-popover-props="{ trigger: 'hover' }"
                                max-tag-count="responsive" style="width: 150px;" :placeholder="$t('请选择知识库')" />
                        </NFormItem>
                        <NFormItem>
                            <NSelect :options="visibleModelList" v-model:value="shareModel" style="width: 290px;" />
                        </NFormItem>
                        <NFormItem>
                            <NButton type="success" @click="createShare(title, shareModelDto, knowledges)">{{ $t("分享")
                            }}
                            </NButton>
                        </NFormItem>
                    </NForm>
                </div>
                <span style="position: absolute;margin-top: -25px;">{{
                    $t("提示：如果分享列表为空，分享连接服务将自动停止，此时外网无法通过AingDesk访问到任何模型")
                    }}</span>
            </div>
            <NDataTable :columns="labelColumns" :data="shareHistory" />
        </NCard>
    </NModal>

    <!-- 修改分享 -->
    <NModal v-model:show="modifyShareShow" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard :title="$t('修改分享')" style="width: 670px;">
            <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="closeModifyShare"></i>
            </template>
            <div>
                <div class="inline-info">
                    <NForm inline>
                        <NFormItem>
                            <NInput style="width:150px" v-model:value="modify_title" :placeholder="$t('请输入名称')" />
                        </NFormItem>
                        <NFormItem>
                            <NSelect :options="knowledgeList" label-field="ragName" value-field="ragName"
                                v-model:value="modify_knowledges" multiple
                                :ellipsis-tag-popover-props="{ trigger: 'hover' }" max-tag-count="responsive"
                                style="width: 150px;" :placeholder="$t('请选择知识库')" />
                        </NFormItem>
                        <NFormItem>
                            <NSelect :options="visibleModelList" v-model:value="modify_shareModel"
                                style="width: 290px;" :render-option="renderOption"/>
                        </NFormItem>
                    </NForm>
                </div>
            </div>
            <div class="flex justify-end items-center gap-5">
                <NButton type="default" @click="closeModifyShare">{{ $t("取消") }}</NButton>
                <NButton type="success"
                    @click="modifyShare(modify_share_id, modify_shareModel_dto, modify_title, modify_knowledges)">{{
                        $t("确认")
                    }}
                </NButton>
            </div>
        </NCard>
    </NModal>

    <!-- 删除分享 -->
    <NModal v-model:show="delShareConfirmShow" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard :title="$t('提示')" style="width: 530px;">
            <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="delShareConfirmShow = false"></i>
            </template>
            <div>
                {{ $t("是否确认删除当前分享") }}
            </div>
            <div class="flex justify-end items-center gap-5">
                <NButton type="default" @click="delShareConfirmShow = false">{{ $t("取消") }}</NButton>
                <NButton type="success" @click="delShare(del_share_id)">{{ $t("确认")
                }}
                </NButton>
            </div>
        </NCard>
    </NModal>
</template>

<script setup lang="tsx">
import useIndexStore from "../store";
import { storeToRefs } from "pinia";
import { NModal, NCard, NButton, NInput, NTooltip, NDataTable, type DataTableColumns, NSelect, NForm, NFormItem } from "naive-ui"
import { useI18n } from "vue-i18n";
import { useClipboard } from "@vueuse/core";
import { message } from "@/utils/naive-tools";
import { computed, ref, watch } from "vue";
import { createShare, getShareList, modifyShare, delShare } from "../controller";
const {
    shareShow,
    modelList,
    shareHistory,
    modifyShareShow,
    currentModel,
    delShareConfirmShow,
    knowledgeList
} = storeToRefs(useIndexStore())
const title = ref("")
const shareModel = ref("")
const shareModelDto = computed(() => {
    return modelList.value.find((item: any) => item.model === shareModel.value)
})
const knowledges = ref([])

const modify_title = ref("")
const modify_shareModel = ref("")
const modify_shareModel_dto = computed(() => {
    return modelList.value.find((item: any) => item.model === modify_shareModel.value)
})
const modify_share_id = ref("")
const modify_knowledges = ref([])
const del_share_id = ref("")
const { t: $t } = useI18n()
const { copy } = useClipboard({ source: "" })
async function copyQuestion(text: string) {
    await copy(text)
    message.success($t("复制成功"))
}

/**
 * @description 过滤整个列表，只允许ollama的模型能够分享
 */
const visibleModelList = computed(() => {
    return modelList.value.filter((item: any) => item)
})

const labelColumns = ref<DataTableColumns>([
    {
        title: $t("名称"),
        key: "title"
    },
    {
        title: $t("模型"),
        key: "model",
        render(row) {
            return <span>{row.model}:{row.parameters}</span>
        }
    },
    {
        title: $t("访问地址"),
        key: "url",
        render(row) {
            return <div class="url-wrapper">
                <NTooltip>
                    {{
                        default: () => row.url,
                        trigger: () => <div class="url-content">{row.url}</div>
                    }}
                </NTooltip>

                <NTooltip>
                    {{
                        default: () => $t("复制"),
                        trigger: () => <i class="i-common:copy w-20 h-20 cursor-pointer" onClick={() => copyQuestion(row.url as string)}></i>
                    }}
                </NTooltip>
            </div>
        }
    },
    {
        title: $t("操作"),
        key: "operation",
        render(row) {
            return <div class="operation-btns">
                <NButton type="success" text onClick={() => openModifyShare(row)}>{$t("修改")}</NButton>
                <NButton type="error" text onClick={() => {
                    del_share_id.value = row.share_id as string
                    delShareConfirmShow.value = true
                }}>{$t("删除")}</NButton>
            </div>
        }
    }
])

/**
 * @description 为下拉选项添加tooltip
 */
function renderOption({node,option}:any){
    return <NTooltip>
        {{
            default: () => option.label,
            trigger: () => node
        }}
    </NTooltip>
}

/**
 * @description 监听，弹窗打开时立即获取分享列表
 */
watch(shareShow, (val) => {
    if (val) {
        shareModel.value = currentModel.value
        getShareList()
    }
})


/**
 * @description 关闭弹窗
 */
function closeShare() {
    shareShow.value = false
    title.value = ""
    shareModel.value = ""
}


/**
 * @description 修改分享
 */
function openModifyShare(row: any) {
    modifyShareShow.value = true
    modify_title.value = row.title
    if (row.supplierName == "ollama") {
        modify_shareModel.value = `${row.model}:${row.parameters}`
    } else {
        modify_shareModel.value = row.model
    }
    modify_knowledges.value = row.rag_list
    modify_share_id.value = row.share_id

}

/**
 * @description 关闭修改分享弹窗
 */
function closeModifyShare() {
    modifyShareShow.value = false
    modify_title.value = ""
    modify_shareModel.value = ""
}



</script>

<style scoped lang="scss">
.modal-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
    gap: 20px;
}

.inline-info {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 10px;

    .item-label {
        width: 60px;
        display: block;
        text-align: right;
    }
}

:deep(.operation-btns) {
    display: flex;
    gap: 15px;
}

:deep(.url-wrapper) {
    display: flex;
    justify-content: flex-start;
    gap: 5px;

    .url-content {
        width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>