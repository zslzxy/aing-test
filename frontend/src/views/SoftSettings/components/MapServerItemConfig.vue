<template>
	<div class="tit">
		<div class="flex justify-start items-center">
			<span class="ml-5 mr-5 text-[16px]">{{ currentMcpChoose.name }}</span>
			<n-tooltip trigger="hover" v-if="mcpServerEditMode">
				<template #trigger>
					<i class="i-weui:delete-outlined w-20 h-20 cursor-pointer mr-10" @click="handleDeleteMcpServer(currentMcpChoose.name)"></i>
				</template>
				{{ $t('删除MCP服务器') }}
			</n-tooltip>
		</div>
		<div class="flex justify-end items-center">
			<n-button type="primary" size="small" class="mr-10" @click="handleAddMcpServer">{{ $t(mcpServerEditMode ? '保存' : '添加') }}</n-button>
			<n-tooltip trigger="hover" v-if="'isActive' in currentMcpChoose">
				<template #trigger>
					<n-switch size="small" v-model:value="currentMcpChoose.isActive" @update:value="handleCurrentMcpStatus"></n-switch>
				</template>
				{{ $t('是否可用') }}
			</n-tooltip>
		</div>
	</div>

	<n-scrollbar style="height: 480px">
		<n-form label-placement="top" class="mt-20" :model="currentMcpChoose" :rules="rules" ref="createMcpServerRef">
			<n-form-item :label="$t('名称')" path="name">
				<n-input :placeholder="$t('请输入MCP服务器名称')" :disabled="mcpServerEditMode" v-model:value="currentMcpChoose.name" />
			</n-form-item>
			<n-form-item :label="$t('描述')" path="description">
				<n-input :placeholder="$t('请输入内容')" v-model:value="currentMcpChoose.description" type="textarea" />
			</n-form-item>
			<n-form-item :label="$t('类型')" path="type">
				<n-radio-group v-model:value="currentMcpChoose.type" name="radiogroup">
					<n-space>
						<n-radio :value="'stdio'">Stdio</n-radio>
						<n-radio :value="'sse'">SSE</n-radio>
					</n-space>
				</n-radio-group>
			</n-form-item>
			<template v-if="currentMcpChoose.type === 'sse'">
				<n-form-item :label="$t('服务器地址')" path="baseUrl">
					<n-input :placeholder="$t('请输入服务器URL地址')" v-model:value="currentMcpChoose.baseUrl" />
				</n-form-item>
			</template>
			<template v-else>
				<n-form-item :label="$t('程序类型')">
					<n-radio-group v-model:value="commadType" name="radiogroup" @update:value="onChangeCommadType">
						<n-space>
							<n-radio value="npx">NPX</n-radio>
							<n-radio value="custom">{{ $t('自定义') }}</n-radio>
						</n-space>
					</n-radio-group>
				</n-form-item>
				<div class="flex" v-if="envStatus.node_npx === 0 && commadType === 'npx'">
					{{ $t('当前未安装Nodejs环境，点击')
					}}<n-button text type="info" @click="installEnv('nodejs')" style="font-size: 12px">
						{{ $t('立即安装') }}
					</n-button>
				</div>
				<n-form-item :label="$t('命令')" path="command" v-if="commadType !== 'npx'">
					<n-input :placeholder="$t('可执行命令')" v-model:value="currentMcpChoose.command" />
				</n-form-item>
				<n-form-item :label="$t('参数')" path="args">
					<n-input :placeholder="$t('请输入内容')" type="textarea" v-model:value="currentMcpChoose.args" />
				</n-form-item>
				<n-form-item :label="$t('环境变量')" path="env">
					<n-input placeholder="ak=123456&#10;sk=678910" type="textarea" v-model:value="currentMcpChoose.env" />
				</n-form-item>
			</template>
		</n-form>
	</n-scrollbar>

	<n-modal v-model:show="envInstallShow" :close-on-esc="false" :closable="false" :mask-closable="false">
		<n-card style="width: 30%; max-width: 500px">
			<div class="flex justify-center items-center gap-2.5">
				<n-spin size="small" />
				<div>{{ $t('正在安装环境,这可能需要几分钟......') }}</div>
			</div>
		</n-card>
	</n-modal>
</template>
<script setup lang="ts">
import { getSoftSettingsStoreData } from '../store';
import { installEnv, handleAddMcpServer, handleDeleteMcpServer, handleCurrentMcpStatus,onChangeCommadType } from '../controller';

import i18n from '@/lang';

const { currentMcpChoose, mcpServerEditMode, envStatus, envInstallShow, createMcpServerRef,commadType } = getSoftSettingsStoreData();
const $t = i18n.global.t;

const rules = ref({
	name: [{ required: true, message: $t('请输入MCP服务器名称'), trigger: 'blur' }],
	baseUrl: [{ required: true, message: $t('请输入服务器URL地址'), trigger: 'blur' }],
	command: [{ required: true, message: $t('请输入可执行命令'), trigger: 'blur' }],
});
</script>
<style scoped lang="scss">
@use '@/assets/base';
.tit {
	font-weight: bold;
	@include base.row-flex-between;
	border-bottom: 1px solid rgb(221.7, 222.6, 224.4);
	padding-bottom: 15px;
}

.config-item {
	margin-top: 10px;

	.item-tit {
		margin-bottom: 5px;
	}
}
</style>
