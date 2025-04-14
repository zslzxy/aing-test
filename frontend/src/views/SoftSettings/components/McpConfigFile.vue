<template>
	<n-modal v-model:show="mcpConfigFileShow" preset="dialog" :title="$t('编辑配置文件')" style="width: 800px" :show-icon="false">
		<template #close>
			<i class="i-tdesign:close-circle w-20 h-20 cursor-pointer text-[#909399]" @click="mcpConfigFileShow = false"></i>
		</template>
		<n-input v-model:value="mcpConfigFileContent" type="textarea" class="h-400" placeholder="{}" />
		<span class="text-[var(--bt-tit-color-secondary)]">{{ $t('编辑MCP服务器配置的JSON。保存前请确保格式正确。') }}</span>
		<div class="modal-footer">
			<n-button type="default" ghost @click="mcpConfigFileShow = false">{{ $t('取消') }}</n-button>
			<n-button type="success" ghost @click="saveMcpConfigFile({ mcp_config_body: mcpConfigFileContent })">{{ $t('确认') }} </n-button>
		</div>
	</n-modal>
</template>
<script lang="ts" setup>
import { getSoftSettingsStoreData } from '../store';
import { saveMcpConfigFile } from '../controller';
import i18n from '@/lang';

const $t = i18n.global.t;
const { mcpConfigFileShow, mcpConfigFileContent } = getSoftSettingsStoreData();
</script>
<style scoped lang="scss">
@use '@/assets/base';

.modal-footer {
	width: 100%;
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
	gap: 20px;
}
</style>
