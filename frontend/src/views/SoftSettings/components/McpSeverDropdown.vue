<template>
		<n-scrollbar style="max-height: 300px">
			<div class="subtitle text-[var(--bt-tit-color-secondary)]">{{ $t('新配置') }}</div>
			<n-list hoverable clickable>
				<n-list-item @click="handleAddMcp({ name: '', description: '', type: 'stdio', command: 'npx', baseUrl: '', env: '', args: '' })">
					<div class="list-item">
						<span class="title-wrapper">{{ $t('自定义') }}</span>
					</div>
				</n-list-item>
			</n-list>
			<div class="subtitle text-[var(--bt-tit-color-secondary)]">{{ $t('预设模板') }}</div>
			<n-list hoverable clickable>
				<n-list-item v-for="item in mcpServerTempList" @click="handleAddMcp(item)">
					<div class="list-item">
						<span class="title-wrapper">{{ item.name }}</span>
					</div>
				</n-list-item>
			</n-list>
		</n-scrollbar>
</template>

<script setup lang="ts">
import { handleAddMcp } from '../controller';
import { getSoftSettingsStoreData } from '../store';
import i18n from '@/lang';

const $t = i18n.global.t;
const { mcpServerTempList } = getSoftSettingsStoreData();
</script>

<style scoped lang="scss">
@use '@/assets/base';

.list-item {
	@include base.row-flex-between;
	padding-left: 8px;
}
.subtitle {
	opacity: var(--n-option-opacity-disabled);
	padding: 8px 10px !important;
}

:deep(.n-list-item) {
	padding: 8px 10px !important;
}
</style>
