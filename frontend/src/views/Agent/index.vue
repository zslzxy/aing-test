<template>
	<NModal :show="agentShow" preset="dialog" :title="$t('智能体')" style="width: 740px" :show-icon="false">
		<template #close>
			<i class="i-tdesign:close-circle w-20 h-20 cursor-pointer text-[#909399]" @click="agentShow = false"></i>
		</template>
		<div class="agent-wrapper">
			<NButton type="primary" ghost class="mb-10" @click="createAgentShow = true">
				<template #icon>
					<i class="i-tdesign:add-circle"></i>
				</template>
				{{ $t('创建智能体') }}
			</NButton>
			<NDivider style="margin-top: 10px; margin-bottom: 10px" />
			<NTabs>
				<NTabPane :tab="$t('我的智能体')" name="my-agent">
					<NScrollbar class="max-h-300px">
						<MyAgent />
					</NScrollbar>
				</NTabPane>
			</NTabs>
			<NDivider style="margin-top: 10px; margin-bottom: 10px" />
			<NTabs>
				<NTabPane :tab="$t('预设模板')" name="my-agent">
					<NScrollbar class="max-h-300px">
						<PresetAgent />
					</NScrollbar>
				</NTabPane>
			</NTabs>
		</div>
	</NModal>
	<!-- 创建智能体 -->
	<CreateAgent />
</template>

<script setup lang="ts">
import { NModal, NButton, NTabs, NTabPane, NDivider, NScrollbar } from 'naive-ui';
import MyAgent from './components/MyAgent.vue';
import PresetAgent from './components/PresetAgent.vue';
import CreateAgent from '@/views/Agent/components/CreateAgent.vue';
import { getAgentStoreData } from './store';
import { useI18n } from 'vue-i18n';
import { getAgentList } from '@/views/Agent/controller/index';
const { t: $t } = useI18n();

const { agentShow, createAgentShow } = getAgentStoreData();

// 获取智能体列表
getAgentList();
</script>

<style scoped lang="scss">
@use '@/assets/base';

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
			@include span-style();
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
