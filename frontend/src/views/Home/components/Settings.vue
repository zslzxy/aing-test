<template>
    <NModal v-model:show="settingsShow" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard style="width: 49%;min-width: 920px;max-width: 1000px;" :title="$t('设置')">
            <template #header-extra>
                <i class="i-tdesign:close-circle w-24 h-24 cursor-pointer text-[#909399]"
                    @click="settingsShow = false"></i>
            </template>
            <!-- <NAlert type="success">
                <div class="mb-10">{{ $t("处理器:") }} {{ pcInfo.cpu_model }} {{ pcInfo.cpu_cores }} {{ pcInfo.cpu_clock }}
                </div>
                <div class="mb-10">{{ $t("内存:") }} {{ getByteUnit(pcInfo.memory_size, true, 2, "GB") }} /
                    {{ getByteUnit(pcInfo.free_memory_size, true, 2, "GB") }} {{ $t("可用") }}</div>
                <div class="mb-10">{{ $t("显卡:") }} {{ pcInfo.gpu_model ? pcInfo.gpu_model : "--" }}</div>
                <div>{{ $t("建议:") }} {{ pcInfo.recommend }}</div>
            </NAlert> -->
            <div class="ollama-url">
                <NInputGroup class="w-45%">
                    <NButton>{{ $t("Ollama接口地址") }}</NButton>
                    <NInput placeholder="请填写ollama接入地址" v-model:value="ollamaUrl" />
                    <NButton type="primary" @click="setOllamaUrl">{{ $t("保存") }}</NButton>
                </NInputGroup>
                <div class="notice" v-if="!isInstalledManager">{{ $t("当前ollama地址不可用") }}</div>
            </div>
            <div class="mt-20" v-if="modelList.length == 0">{{ $t("首次使用，请选择要安装的模型") }}</div>

            <div class="mt-20" :class="{ mask: !ollamaUrl }">
                <div class="flex justify-between items-center mb-10">
                    <NInputGroup>
                        <NInput v-model:value="search" @keydown.enter.native="handleSearch" :style="{ width: '220px' }"
                            :placeholder='`${$t("如:")} deepseek-r1`' />
                        <NButton type="primary" @click="handleSearch" ghost>
                            {{ $t("搜索") }}
                        </NButton>
                    </NInputGroup>
                    <NRadioGroup v-model:value="modeType" @update:value="handleSearch">
                        <NRadioButton v-for="tl in toolsList" :key="tl.value" :value="tl.value" :label="tl.label" />
                    </NRadioGroup>
                </div>
                <NDataTable :columns="modelColumns" :data="filterList" :pagination="pagination" style="height: 400px;"
                    flex-height />
            </div>

            <!-- <div class="mt-20 flex justify-start items-center gap-2.5">
                <span>安装到</span>
                <NSelect :options="optionsDisk" style="max-width:300px" />
                <span>可用空间: 87.1GB</span>
            </div> -->

            <!-- <div class="flex justify-end items-center mt-20">
                <NButton type="default" @click="settingsShow = false" class="mr-20">取消</NButton>
                <NButton type="primary" :disabled="modelNameForInstall.model ? false : true" @click="installModel">一键安装
                </NButton>
            </div> -->
        </NCard>
    </NModal>

    <!-- 安装进度 -->
    <Install />

    <!-- 刪除進度 -->
    <NModal v-model:show="modelDelLoading" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard style="width:30%;max-width: 300px;">
            <div class="flex justify-center items-center flex-col">
                <div class="mb-20">{{ $t("模型刪除中，请稍后") }}</div>
                <NSpin size="medium" />
            </div>
        </NCard>
    </NModal>

    <!-- 询问安装模型管理器 -->
    <NModal v-model:show="managerInstallConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard style="width:45%;max-width: 560px; min-width: 500px;" :title='$t("提示")'>
            <!-- <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="managerInstallConfirm = false"></i>
            </template> -->
            <div class="flex justify-start items-center">
                <div class="mb-20">{{ $t("检测到您没有安装模型管理器，是否立即安装？") }}</div>
            </div>
            <NForm label-placement="left" label-width="100px">
                <NFormItem :label="$t('模型管理器')" path="manager">
                    <NSelect :options="managerList" v-model:value="managerForInstall" />
                </NFormItem>
                <NFormItem :label="$t('模型存储位置')" path="model_path">
                    <NButton @click="chooseOllamaPath">{{ modelManagerInstallPath ? modelManagerInstallPath : $t("选择")
                    }}
                    </NButton>
                </NFormItem>
            </NForm>
            <div class="flex justify-end gap-5 mt-50">
                <NButton type="default" @click="doNotInstallModelManagerNow">{{ $t("暂不安装") }}</NButton>
                <NButton type="success" @click="installModelManager">{{ $t("立即安装") }}</NButton>
            </div>
        </NCard>
    </NModal>

    <!-- 模型管理器安装进度 -->
    <NModal v-model:show="modelManagerInstallProgresShow" :close-on-esc="false" :closable="false"
        :mask-closable="false">
        <NCard :title='modelManagerInstallNotice' style="width: 40%;max-width: 560px; min-width: 500px;">
            <NProgress :percentage="modelManagerInstallProgress.progress" indicator-placement="inside" processing />
            <div class="flex mt-20 justify-start gap-10 items-center">
                <span>{{ $t("大小:") }} {{ getByteUnit(modelManagerInstallProgress.total, true) }}</span>
                <span>{{ $t("已下载:") }} {{ getByteUnit(modelManagerInstallProgress.completed, true) }}</span>
                <span class="flex">
                    <span>
                        {{ $t("速度:") }} {{ getByteUnit(modelManagerInstallProgress.speed, true) }}
                    </span>
                    <span class="cursor-pointer ml-6 flex items-center" @click="reconnect_model_download">
                        <NTooltip trigger="hover">
                            <template #trigger>
                                <i class="i-common:refresh w-16 h-16"></i>
                            </template>
                            {{ $t("尝试重新选择下载节点，以优化下载速度，PS:不会丢失当前下载进度，将自动断点续传。") }}
                        </NTooltip>
                    </span>
                </span>
            </div>
        </NCard>
    </NModal>

    <!-- 删除模型问询 -->
    <NModal v-model:show="modelDelConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard style="width:45%;max-width: 560px; min-width: 500px;" :title='$t("提示")'>
            <div class="flex justify-start items-center">
                <div class="mb-20">{{ $t("是否确认删除模型，该操作不可逆？") }}</div>
            </div>
            <div class="flex justify-end gap-5 mt-20">
                <NButton type="default" @click="cancelRemoveModel">{{ $t("取消") }}</NButton>
                <NButton type="error" @click="doRemoveModel">{{ $t("删除") }}</NButton>
            </div>
        </NCard>
    </NModal>
</template>

<script lang="tsx" setup>
import { nextTick, ref, watch } from "vue";
import {
    NModal,
    NCard,
    NSpin,
    NAlert,
    NSelect,
    NButton,
    NDataTable,
    NInputGroup,
    NInput,
    NRadioGroup,
    NRadioButton,
    NTooltip,
    type DataTableColumns,
    NTag,
    NProgress,
    NForm,
    NFormItem
} from "naive-ui"
import useIndexStore from "../store";
import { storeToRefs } from "pinia";
import {
    getVisibleModelList,
    getDiskList,
    installModel,
    isInstalled,
    removeModel,
    installModelManager,
    reconnect_model_download,
    chooseOllamaPath,
    setOllamaUrl,

} from "../controller/index.tsx"
import { getByteUnit } from "@/utils/tools"
import Install from "./Install.vue";
import { useI18n } from "vue-i18n";
import { eventBUS } from "../utils/tools.tsx";
const { t: $t } = useI18n()
const {
    settingsShow,
    pcInfo,
    modelList,
    visibleModelList,
    modelNameForInstall,
    modelForDel,
    modelDelLoading,
    managerInstallConfirm,
    managerForInstall,
    modelManagerInstallProgresShow,
    modelManagerInstallProgress,
    isResetModelList,
    currentLanguage,
    modelDelConfirm,
    modelManagerInstallNotice,
    modelManagerInstallPath,
    isInstalledManager,
    ollamaUrl
} = storeToRefs(useIndexStore())

const filterList = ref<any[]>([])
const search = ref("")
const modeType = ref("all")
const toolsList = ref([
    { label: $t("所有"), value: "all" },
    { label: "LLM", value: "llm" },
    { label: "Vision", value: "vision" },
    { label: "Embedding", value: "embedding" },
    { label: "Tools", value: "tools" },
    { label: $t("已安装"), value: "installed" }
])
watch(currentLanguage, () => {
    toolsList.value = [
        { label: $t("所有"), value: "all" },
        { label: "LLM", value: "llm" },
        { label: "Vision", value: "vision" },
        { label: "Embedding", value: "embedding" },
        { label: "Tools", value: "tools" },
        { label: $t("已安装"), value: "installed" }
    ]
})

// 搜索
const handleSearch = async () => {
    await getVisibleModelList()
    filterList.value = visibleModelList.value.filter((item) => {
        //模型含有搜索内容，且功能类型为选中的功能类型
        return item.full_name.toLowerCase().includes(search.value.toLowerCase()) && (modeType.value == "all" ? true : modeType.value === 'installed' ? item.install : item.capability.includes(modeType.value))
    })

    if (search.value == "") {
        pagination.value.page = 1
    }
}

const managerList = ref([
    { label: "ollama", value: "ollama" }
])

/**
 * @description 监听安装模型后的回调
 */
eventBUS.$on("modelInstalled", (type) => {
    if (type) modeType.value = type
    nextTick(handleSearch)
})

const modelColumns = ref<DataTableColumns>([
    {
        title: $t("模型"),
        key: "full_name",
        width: "160px",
        render(row: any) {
            return <span class="cursor-pointer text-[#20a53a]" onClick={() => window.open(row.link)} >{row.full_name}</span>
        }
    },
    {
        title: $t("大小"),
        key: "download_size",
        width: "80px"
    },
    {
        title: $t("简介"),
        key: "title",
        width: "265px",
        ellipsis: true,
        render(row) {
            return <NTooltip trigger="hover">
                {{
                    trigger: () => <div class="cursor-pointer">{row.title}</div>,
                    default: () => <div style="max-width:300px">{row.title}</div>
                }}

            </NTooltip>
        }
    },
    {
        title: $t('功能'),
        key: 'capability',
        render(row: any) {
            return row.capability.map((item: string) => {
                return <NTag class="mr-4">{item}</NTag>
            })
        }
    },
    {
        title: $t("操作"),
        key: "operation",
        width: "80px",
        render(row) {
            return <div class="flex justify-between items-center" style="width:100%">
                {row.install ?
                    <NButton size="small" type="error" class="cursor-pointer" onClick={() => removeModelConfirm(row.full_name as string)}>{$t("刪除")}</NButton> :
                    <NButton size="small" type="success" class="cursor-pointer" onClick={() => installModelConfirm({ model: row.model as string, parameters: row.parameters as string })}>{$t("安装")}</NButton>
                }
            </div>
        }
    }
])

const pagination = ref({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 50, 100],
    onChange: (page: number) => {
        pagination.value.page = page
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.value.pageSize = pageSize
        pagination.value.page = 1
    }
})

/**
 * @description 获取所有可用模型列表
 */
// getVisibleModelList()

watch(settingsShow, (val) => {
    if (val) {
        getVisibleModelList()

        /**
         * @description 获取本地盘符信息
         */
        getDiskList()
    } else {
        modeType.value = "all"
    }
})


/**
 * @description 安装模型
 */
function installModelConfirm(modelInfo: { model: string, parameters: string }) {
    modelNameForInstall.value = modelInfo
    installModel()
}



/**
 * @description 刪除模型询问
 */
function removeModelConfirm(model: string) {
    modelDelConfirm.value = true
    modelForDel.value = model
}

/**
 * @description 确认删除模型
 */
function doRemoveModel() {
    modelDelLoading.value = true
    removeModel()
    getVisibleModelList()
}

/**
 * @description 取消删除模型
 */
function cancelRemoveModel() {
    modelDelConfirm.value = false
    modelForDel.value = ""
}

/**
 * @description 暂不安装模型管理器
 */
function doNotInstallModelManagerNow() {
    settingsShow.value = false
    managerInstallConfirm.value = false
}
// 手动更新安装ollama的列表数据
watch(() => isResetModelList.value.status, (val) => {
    if (val) {
        filterList.value = visibleModelList.value
        isResetModelList.value = {
            status: false,
            type: 0
        }
    }
})

watch(() => settingsShow.value, (val) => {
    if (!val) {
        search.value = ""
    } else {
        filterList.value = visibleModelList.value
    }
}, { immediate: true })
</script>

<style scoped lang="scss">
@use "@/assets/base";

@mixin tools {
    height: 40px;
    visibility: hidden;
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;

    .tool-item {
        cursor: pointer;
        display: flex;
        padding: 4px;
        transition: .2s;
        border-radius: 4px;

        &:hover {
            background: #f5f5f5;
        }
    }
}

.mask {
    position: relative;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        pointer-events: none;
        z-index: 100;
        pointer-events: auto;
    }
}

.ollama-url {
    @include base.row-flex-between;
    justify-content: start;

    .notice {
        color: #ff4d4f
    }
}
</style>