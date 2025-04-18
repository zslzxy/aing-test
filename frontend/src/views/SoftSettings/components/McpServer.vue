<template>
	<div class="mcp-server">
		<div class="mcp-list">
			<!-- 添加服务器 -->
			<n-popover trigger="hover" placement="bottom">
				<template #trigger>
					<n-button type="primary" ghost class="w-100% mb-10">
						{{ $t('添加服务器') }}
					</n-button>
				</template>
				<McpSeverDropdown />
			</n-popover>
			<n-scrollbar style="height: 440px">
				<div class="has-server-item  cursor-pointer" :class="{active:currentMcpName === item.name }" v-for="item in mcpServerList" @click="handleEditMcp(item.name)">
					<n-tooltip trigger="hover">
						<template #trigger>
							<span class="has-server-left">
								<div class="flex items-center">
									<i class="i-grommet-icons:cli mr-8"></i>
									<span class="title-wrapper !w-88">{{ item.name }}</span>
								</div>
								<span class="status" :class="{ active: item.isActive }"></span>
							</span>
						</template>
						{{ item.name }}
					</n-tooltip>
				</div>
			</n-scrollbar>
				<div class="flex items-center justify-start">
					<n-button class="w-100% mt-30" @click="openMcpConfigFile">{{ $t('编辑配置文件') }}</n-button>
				</div>
		</div>
		<div class="mcp-content relative w-590">
			<MapServerItemConfig v-if="mcpServerFormShow" />
		</div>
		<McpConfigFile />
	</div>
</template>

<script setup lang="ts">
import MapServerItemConfig from './MapServerItemConfig.vue';
import McpSeverDropdown from './McpSeverDropdown.vue';
import McpConfigFile from './McpConfigFile.vue';
import { checkEnvStatus, getMcpServerList, getMcpTempList, handleEditMcp,openMcpConfigFile } from '../controller';
import { getSoftSettingsStoreData } from '../store';
import { getGlobalStore } from '@/stores/global';
import i18n from '@/lang';

const $t = i18n.global.t;
const { mcpServerList, mcpServerFormShow,currentMcpName } = getSoftSettingsStoreData();
const { settingPanelBorder,siderBg } = getGlobalStore();
checkEnvStatus();
getMcpServerList();
getMcpTempList();
</script>

<style scoped lang="scss">
@use '@/assets/base';

.mcp-server {
	width: 780px;
	height: 100%;
	display: grid;
	grid-template-columns: 160px 1fr;
	grid-gap: 10px;

	.mcp-list {
		height: 100%;
		border-right: v-bind(settingPanelBorder);
		box-sizing: border-box;
		padding: 10px 10px 10px 0;
	}

	.has-server-item {
		box-sizing: border-box;
		padding: 10px;
		@include base.row-flex-between;
		&.active {
				background-color: base.$list-item-hover;
		}

		&:hover {
			background: v-bind(siderBg);
		}
		.has-server-left {
			display: flex;
			align-items: center;
			.title-wrapper {
				display: inline-block;
				width: 60px;
				@include base.single-line-ellipsis;
			}
			.status {
				width: 8px;
				height: 8px;
				margin-left: 10px;
				border-radius: 50%;
				background: base.$gray-5;
				&.active {
					background: var(--bt-theme-color);
				}
			}
		}
	}
}
</style>
