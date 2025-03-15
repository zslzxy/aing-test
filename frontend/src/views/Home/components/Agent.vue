<template>
    <NModal :show="agentShow" preset="dialog" :title="$t('智能体')" style="width: 740px;" :show-icon="false">
        <template #close>
            <i class="i-tdesign:close-circle w-20 h-20 cursor-pointer text-[#909399]" @click="agentShow = false"></i>
        </template>
        <div class="agent-wrapper">
            <NButton type="primary" ghost class="mb-10" @click="createAgentShow = true">
                <template #icon>
                    <i class="i-tdesign:add-circle"></i>
                </template>
                {{ $t("创建智能体") }}
            </NButton>
            <NDivider style="margin-top: 10px; margin-bottom: 10px;" />
            <NTabs>
                <NTabPane :tab="$t('我的智能体')" name="my-agent">
                    <NScrollbar class="max-h-300px">
                        <div class="flex flex-wrap gap-10 justify-start items-center">
                            <NCard hoverable class="w-200 cursor-pointer" v-for="item in myAgentList"
                                :key="item.create_time" @click="chooseAgentForChat(item)">
                                <div class="flex justify-between items-center">
                                    <div class="agent-card">
                                        <span class="emoji-span">{{ item.icon ? item.icon : "😀" }}</span>
                                        <span class="text">{{
                                            item.agent_title
                                        }}</span>
                                    </div>
                                    <NDropdown trigger="click" :options="options"
                                        @select="(key) => handleAgentOperation(key, item)">
                                        <i class="i-tdesign:ellipsis w-20 h-20 cursor-pointer" @click.stop></i>
                                    </NDropdown>
                                </div>
                            </NCard>
                        </div>
                    </NScrollbar>
                </NTabPane>
            </NTabs>
            <NDivider style="margin-top: 10px; margin-bottom: 10px;" />
            <NTabs>
                <NTabPane :tab="$t('预设模板')" name="my-agent">
                    <NScrollbar class="max-h-300px">
                        <div class="flex flex-wrap gap-10 justify-start items-center">
                            <NCard hoverable class="w-200 cursor-pointer" v-for="item in systemAgentList"
                                :key="item.create_time" @click="chooseAgentForChat(item)">
                                <div class="flex justify-between items-center">
                                    <div class="agent-card">
                                        <span class="emoji-span">{{ item.icon ? item.icon : "😀" }}</span>
                                        <span class="text">{{
                                            item.agent_title
                                            }}</span>
                                    </div>
                                </div>
                            </NCard>
                        </div>
                    </NScrollbar>
                </NTabPane>
            </NTabs>
        </div>
    </NModal>
    <!-- 创建智能体 -->
    <CreateAgent />
</template>

<script setup lang="ts">
import { NModal, NButton, NInput, NCard, NTabs, NTabPane, NDivider, NDropdown, NImage, NScrollbar } from 'naive-ui';
import CreateAgent from './CreateAgent.vue';
import { getIndexStore } from '../controller';
import { useI18n } from 'vue-i18n';
import { getAgentList, removeAgent, chooseAgentForChat } from '../controller';
import { computed, ref } from 'vue';
import type { AgentItemDto } from '../store';
const { t: $t } = useI18n()
const {
    agentShow,
    createAgentShow,
    agentList,
    createAgentFormData,
    isEditAgent,
} = getIndexStore()
// 获取智能体列表
getAgentList()

// 智能体操作
const options = ref([
    { label: $t('编辑'), key: 'edit' },
    { label: $t('删除'), key: 'delete' },
])

// 计算我的智能体和系统预设
const myAgentList = computed(() => agentList.value.filter(item => !item.is_system))
const systemAgentList = computed(() => agentList.value.filter(item => item.is_system))

/**
 * @description 智能体操作回调
 */
function handleAgentOperation(key: string, agent: AgentItemDto) {
    if (key == "edit") {
        createAgentShow.value = true
        createAgentFormData.value = agent
        isEditAgent.value = true
    } else {
        removeAgent(agent)
    }
}   
</script>

<style scoped lang="scss">
@use "@/assets/base";

.agent-wrapper {
    .agent-card {
        cursor: pointer;
        @include base.row-flex-between;
        justify-content: start;
        align-items: center;

        @mixin span-style {
            display: inline-block;
            height: 36px;
            line-height: 36px;
        }

        .emoji-span {
            background: base.$gray-3;
            text-align: center;
            font-size: 24px;
            border-radius: 50%;
            @include span-style()
        }

        .text {
            @include span-style();
        }
    }

}

:deep(.n-card__content) {
    padding: 8px !important;
}
</style>