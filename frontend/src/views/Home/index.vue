<template>
    <NLayout :has-sider="true" class="layout-wrapper">
        <NLayoutSider :width="siderWidth" class="layout-sider">
            <Sider />
        </NLayoutSider>
        <NLayout>
            <NLayoutHeader class="layout-header">
                <Header />
            </NLayoutHeader>
            <NLayoutContent class="layout-content" style="">
                <Content />
            </NLayoutContent>
        </NLayout>
    </NLayout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutContent, NLayoutHeader } from "naive-ui"
import Sider from "./components/Sider.vue";
import Header from "./components/Header.vue";
import Content from "./components/Content.vue";
import { get_languages } from "./controller"
import useIndexStore from "./store";
import { storeToRefs } from "pinia";
const { siderWidth } = storeToRefs(useIndexStore())

/**
 * @description 获取支持的语言和语言列表
 */
 get_languages()
</script>

<style scoped lang="scss">
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
</style>