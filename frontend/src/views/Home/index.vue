<template>
    <NLayout :has-sider="true" class="layout-wrapper">
        <NLayoutSider :width="siderWidth" class="layout-sider">
            <Sider />
        </NLayoutSider>
        <NLayoutSider :class="['layout-sider', { 'no-border': knowledgeSiderWidth == 0 }]" :width="knowledgeSiderWidth">
            <KnowledgeStore />
        </NLayoutSider>
        <NLayout>
            <NLayoutHeader class="layout-header">
                <Header />
            </NLayoutHeader>
            <NLayoutContent class="layout-content" style="padding:0">
                <Content />
                <!-- <WelcomeContent /> -->
            </NLayoutContent>
        </NLayout>
    </NLayout>

    <!-- 欢迎界面 -->
    <Welcome />
    <!-- 第三方api弹窗 -->
    <ThirdPartyApi />

    <!-- 更换目录时数据迁移进度 -->
    <NModal v-model:show="dataPathChangeCheckShow">
        <NCard class="w-600">
            <template #header>
                <div class="flex justify-start items-center gap-1.25">
                    <i class="i-tdesign:error-circle w-20 h-20 text-[#E6A23C]"></i><span class="text-4">{{
                        pathChangeNotice }},{{ $t("请勿关闭软件,否则将导致软件异常") }}</span>
                </div>
            </template>
            <div class="flex justify-between items-center mb-5">
                <span>{{ dataPathChangeStatusValues.message || $t("等待复制") }}</span>
                <span>[{{ dataPathChangeStatusValues.fileCurrent }}/{{ dataPathChangeStatusValues.fileTotal }}]</span>
            </div>
            <NProgress type="line" :percentage="dataPathChangeStatusValues.percent" indicator-placement="inside"
                processing>
            </NProgress>
            <div class="flex justify-between items-center mt-20">
                <span>{{ $t("总大小") }}: {{ getByteUnit(dataPathChangeStatusValues.total) }}</span>
                <span>{{ $t("已复制") }}: {{ getByteUnit(dataPathChangeStatusValues.current) }}</span>
                <span>{{ $t("速度") }}: {{ getByteUnit(dataPathChangeStatusValues.speed) }}/s</span>
            </div>
        </NCard>
    </NModal>
</template>

<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutContent, NLayoutHeader, NModal, NCard, NProgress } from "naive-ui"
import Sider from "./components/Sider.vue";
import Header from "./components/Header.vue";
import Content from "./components/Content.vue";
import KnowledgeStore from "./components/KnowledgeStore.vue";
import Welcome from "./components/Welcome.vue";
import ThirdPartyApi from "./components/ThirdPartyApi.vue";
import { get_languages } from "./controller/index.tsx"
import useIndexStore from "./store";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { getByteUnit } from "@/utils/tools"

const { siderWidth, knowledgeSiderWidth, dataPathChangeCheckShow, dataPathChangeStatusValues } = storeToRefs(useIndexStore())
const { t: $t } = useI18n()
/**
 * @description 获取支持的语言和语言列表
 */
get_languages()

// 数据迁移文案计算属性
const pathChangeNotice = computed(() => {
    if (dataPathChangeStatusValues.value.status == 0) {
        return $t("准备迁移数据")
    } else if (dataPathChangeStatusValues.value.status == 1) {
        return $t("迁移数据中")
    }
})
</script>

<style scoped lang="scss">
@use "@/assets/base";

.layout-wrapper {
    height: 100vh;
    background: var(--bt-bg);

    .layout-sider {
        transition: .2s;
        border-right: 1px solid rgba(0, 0, 0, .08);
    }

    .layout-content {
        padding: var(--bt-pd-normal);
        height: calc(100% - 67px);
    }

    .layout-header {
        padding: 0 var(--bt-pd-normal);
        border: 1px solid rgba(0, 0, 0, .12);
        border-left: none;
        border-top: none;
    }
}

.no-border {
    border-right: none !important
}
</style>