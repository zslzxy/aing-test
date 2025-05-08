<template>
    <div class="recent-comunication">
        <!-- 列表 -->
        <ul class="recent-list">
            <li :class="[{ active: item.ragName == activeKnowledge }]" @click="openKnowledgeStore(item)"
                v-for="item in knowledgeList">
                <div class="flex items-center" style="height: 100%;">
                    <i class="i-tdesign:folder w-16 h-16 mr-10 ml-8 text-[var(--bt-tit-color-secondary)]"></i>
                    <div class="comu-title">{{ item.ragName }}</div>
                </div>

                <n-popselect trigger="click" :options='options'
                    :on-update:value="(val: any) => dealPopOperation(val, item)">
                    <div class="flex justify-center items-center" style="height: 100%; padding: 0 8px;" @click.stop>
                        <i class="i-common:more-operation w-16 h-16"></i>
                    </div>
                </n-popselect>
            </li>

            <li @click.stop="createNewKnowledgeStore" :class="{ 'add-knowledge': addingKnowledge }">
                <div class="flex items-center" style="height: 100%;">
                    <i class="i-tdesign:folder-add w-16 h-16 mr-10 ml-8 text-[var(--bt-tit-color-secondary)]"></i>
                    <div class="comu-title">{{ $t("新建知识库") }}</div>
                </div>
            </li>
        </ul>

    </div>
</template>

<script setup lang="tsx">
import { openKnowledgeStore, createNewKnowledgeStore } from "@/views/KnowleadgeStore/controller"
import { dealPopOperation } from "@/views/Sider/controller"
import { getKnowledgeStoreData } from '@/views/KnowleadgeStore/store';
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n()
const { knowledgeList, addingKnowledge, activeKnowledge, } = getKnowledgeStoreData()
const options = [
    { label: $t("删除"), value: "delChat" },
    { label: $t("修改"), value: "modifyTitle" },
    {
        value: "optimization",
        label: $t("优化"),
        render(info: any) {
            return <n-tooltip trigger="hover">
                {
                    {
                        trigger: () => info.node,
                        default:()=><div class="w-200">{$t("增强索引,并释放多余的空间占用")}</div>
                    }
                }
            </n-tooltip>
        }
    }
]

</script>

<style scoped lang="scss">
@use "@/assets/base";

.recent-comunication {
    width: 100%;

    .recent-list {
        @include base.recent-list-style;
    }
}
</style>