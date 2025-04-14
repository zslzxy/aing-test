<template>
    <div class="flex flex-wrap gap-10 justify-start items-center">
        <NCard hoverable class="w-200 cursor-pointer" v-for="item in myAgentList" :key="item.create_time"
            @click="chooseAgentForChat(item)">
            <div class="flex justify-between items-center">
                <div class="agent-card">
                    <span class="emoji-span">{{ item.icon ? item.icon : "😀" }}</span>
                    <span class="text">{{
                        item.agent_title
                        }}</span>
                </div>
                <NDropdown trigger="click" :options="options" @select="(key) => handleAgentOperation(key, item)">
                    <i class="i-tdesign:ellipsis w-20 h-20 cursor-pointer" @click.stop></i>
                </NDropdown>
            </div>
        </NCard>
    </div>
</template>

<script setup lang="ts">
import { NCard, NDropdown, } from 'naive-ui';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { chooseAgentForChat, handleAgentOperation } from "@/views/Agent/controller"
import { getAgentStoreData } from '@/views/Agent/store';
const { t: $t } = useI18n()
const {
    agentList,
} = getAgentStoreData()
// 计算我的智能体列表
const myAgentList = computed(() => agentList.value.filter(item => !item.is_system))
// 智能体操作
const options = ref([
    { label: $t('编辑'), key: 'edit' },
    { label: $t('删除'), key: 'delete' },
])

</script>

<style scoped></style>