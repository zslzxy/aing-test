<template>
    <n-modal v-model:show="settingsShow" :close-on-esc="false" :closable="false" :mask-closable="false">
        <n-card style="width: 49%;min-width: 920px;max-width: 1000px;" :title="$t('设置')">
            <template #header-extra>
                <i class="i-tdesign:close-circle w-24 h-24 cursor-pointer text-[#909399]"
                    @click="settingsShow = false"></i>
            </template>
            <div class="ollama-url">
                <n-input-group class="w-45%">
                    <n-button>{{ $t("Ollama接口地址") }}</n-button>
                    <n-input placeholder="请填写ollama接入地址" v-model:value="ollamaUrl" />
                    <n-button type="primary" @click="setOllamaUrl">{{ $t("保存") }}</n-button>
                </n-input-group>
                <div class="notice" v-if="!isInstalledManager">{{ $t("当前ollama地址不可用") }}</div>
            </div>
            <div class="mt-20" v-if="modelList.length == 0">{{ $t("首次使用，请选择要安装的模型") }}</div>

            <div class="mt-20" :class="{ mask: !ollamaUrl }">
                <div class="flex justify-between items-center mb-10">
                    <n-input-group>
                        <n-input v-model:value="search" @keydown.enter.native="handleSearch" :style="{ width: '220px' }"
                            :placeholder='`${$t("如:")} deepseek-r1`' />
                        <n-button type="primary" @click="handleSearch" ghost>
                            {{ $t("搜索") }}
                        </n-button>
                    </n-input-group>
                    <n-radio-group v-model:value="modeType" @update:value="handleSearch">
                        <n-radio-button v-for="tl in toolsList" :key="tl.value" :value="tl.value" :label="tl.label" />
                    </n-radio-group>
                </div>
                <n-data-table :columns="modelColumns" :data="filterList" :pagination="pagination" style="height: 400px;"
                    flex-height />
            </div>
        </n-card>
    </n-modal>

    <!-- 安装进度 -->
    <Install />

    <!-- 刪除進度 -->
    <DelModelProgress />

    <!-- 询问安装模型管理器 -->
    <InstallModelManagerConfirm />

    <!-- 模型管理器安装进度 -->
    <ModelInstallProgress />

    <!-- 删除模型问询 -->
    <RemoveModelConfirm />
</template>

<script lang="tsx" setup>
import RemoveModelConfirm from "./components/RemoveModelConfirm.vue"
import ModelInstallProgress from "./components/ModelInstallProgress.vue";
import InstallModelManagerConfirm from "./components/InstallModelManagerConfirm.vue";
import DelModelProgress from "./components/DelModelProgress.vue";
import { getSettingsStoreData } from "./store";
import { getSoftSettingsStoreData } from "../SoftSettings/store";
import { getHeaderStoreData } from "../Header/store";

import Install from "@/views/Settings/components/Install.vue";
import { useI18n } from "vue-i18n";
import { eventBUS } from "@/views/Home/utils/tools";

import {
    getVisibleModelList,
    getDiskList,
    setOllamaUrl,
    handleSearch,
    removeModelConfirm,
    installModelConfirm,
} from "./controller"
import type { DataTableColumns } from "naive-ui";

const { t: $t } = useI18n()
const {
    settingsShow,
    visibleModelList,
    isResetModelList,
    isInstalledManager,
    ollamaUrl,
    modeType,
    filterList,
    search,
    pagination
} = getSettingsStoreData()
const {
    modelList,
} = getHeaderStoreData()
const {
    currentLanguage,
} = getSoftSettingsStoreData()


/********** 静态数据 ***********/
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
            return <n-tooltip trigger="hover">
                {{
                    trigger: () => <div class="cursor-pointer">{row.title}</div>,
                    default: () => <div style="max-width:300px">{row.title}</div>
                }}

            </n-tooltip>
        }
    },
    {
        title: $t('功能'),
        key: 'capability',
        render(row: any) {
            return row.capability.map((item: string) => {
                return <n-tag class="mr-4">{item}</n-tag>
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
                    <n-button size="small" type="error" class="cursor-pointer" onClick={() => removeModelConfirm(row.full_name as string)}>{$t("刪除")}</n-button> :
                    <n-button size="small" type="success" class="cursor-pointer" onClick={() => installModelConfirm({ model: row.model as string, parameters: row.parameters as string })}>{$t("安装")}</n-button>
                }
            </div>
        }
    }
])

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


/**
 * @description 监听安装模型后的回调
 */
eventBUS.$on("modelInstalled", (type) => {
    if (type) modeType.value = type
    nextTick(handleSearch)
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