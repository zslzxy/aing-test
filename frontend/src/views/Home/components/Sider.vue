<template>
    <div class="logo">
        <div class=logo-left>
            <NImage :src="logo" object-fit="cover" class="h-50" preview-disabled />
            <span>AingDesk</span>
        </div>
        <div>
            <i class="i-common:fold w-22 h-22 mr-14 cursor-pointer" @click="doFold"></i>
        </div>
    </div>
    <div class="sider-wrapper">
        <!-- 侧边栏上部分 -->
        <div class="sider-top">
            <div class="gap-2.5 flex justify-end pl-10">
                <div class="flex gap-2.5 items-center justify-end">
                    <span>{{ themeMode == 'light' ? $t("浅色模式") : $t("深色模式") }}</span>
                    <NSwitch size="small" active-color="#000" checked-value="dark" unchecked-value="light"
                        v-model:value="themeMode" :on-update:value="changeThemeMode"></NSwitch>
                </div>
            </div>
            <div class="recent-comunication">
                <div class="recent-header">
                    {{ $t("对话") }}
                </div>
                <!-- 最近对话列表 -->
                <ul class="recent-list">
                    <li :class="{ active: currentContextId == item.context_id }"
                        @click.stop="handleChoose($event, item)" v-for="item in chatList" :key="item.context_id">
                        <div class="flex items-center" style="height: 100%;">
                            <i class="i-common:comu w-16 h-16 mr-10 ml-8"></i>
                            <div class="comu-title">{{ item.title ? item.title : $t("对话内容") }}</div>
                        </div>

                        <NPopselect trigger="click" :options='[
                            { label: $t("删除对话"), value: "delChat" },
                            { label: $t("修改标题"), value: "modifyTitle" }
                        ]' :on-update:value="(val) => doChatOperateSelect(val, item.context_id)">
                            <div class="flex justify-center items-center" style="height: 100%; padding: 0 8px;">
                                <i class="i-common:more-operation w-16 h-16"></i>
                            </div>
                        </NPopselect>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 侧边栏下部分 -->
        <div class="sider-bottom">
            <div class="sider-divider"></div>
            <div class="create-comunication" @click="createNewComu">
                <i class="i-common:new-comu w-16 h-16"></i>
                <span>{{ $t("新对话") }}</span>
            </div>
            <div class="create-comunication" @click="openModelManage">
                <i class="i-common:model-manage w-16 h-16"></i>
                <span>{{ $t("模型管理") }}</span>
            </div>
            <!-- <div class="create-comunication" @click="openSettings">
                <i class="i-common:settings w-16 h-16"></i>
                <span>{{ $t("设置") }}</span>
            </div> -->

        </div>
    </div>
    <!-- 删除对话问询 -->
    <NModal v-model:show="chatRemoveConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard :title='$t("删除对话")' style="width: 45%;max-width: 460px;">
            <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="chatRemoveConfirm = false"></i>
            </template>
            {{ $t("是否确认删除当前对话") }}
            <div class="modal-footer">
                <NButton type="default" ghost @click="chatRemoveConfirm = false">{{ $t("取消") }}</NButton>
                <NButton type="error" ghost @click="removeChat(contextIdForDel)">{{ $t("删除") }}</NButton>
            </div>
        </NCard>
    </NModal>

    <!-- 修改对话标题确认框 -->
    <NModal v-model:show="chatModifyConfirm" :close-on-esc="false" :closable="false" :mask-closable="false">
        <NCard :title='$t("修改对话标题")' style="width: 45%;max-width: 460px;">
            <template #header-extra>
                <i class="i-common:close w-24 h-24 cursor-pointer" @click="chatModifyConfirm = false"></i>
            </template>
            <NInput v-model:value="newChatTitle" :placeholder='$t("请输入新的对话标题")'
                @keydown.enter="modifyChatTitle({ context_id: contextIdForModify, title: newChatTitle })" />
            <div class="modal-footer">
                <NButton type="default" ghost @click="chatModifyConfirm = false">{{ $t("取消") }}</NButton>
                <NButton type="success" ghost
                    @click="modifyChatTitle({ context_id: contextIdForModify, title: newChatTitle })">{{ $t("确认") }}
                </NButton>
            </div>
        </NCard>
    </NModal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { NModal, NButton, NImage, NCard, NPopselect, NInput, NSwitch, NSelect } from 'naive-ui';
import { get_chat_list, removeChat, modifyChatTitle, getChatInfo } from "../controller";
import useIndexStore, { type ChatItemInfo } from "../store";
import { storeToRefs } from "pinia";
import logoImage from "@/assets/images/logo.png"
import logoDark from "@/assets/images/logo-dark.png"
import Storage from "@/utils/storage"
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n()
const {
    chatList,
    currentContextId,
    siderWidth,
    isFold,
    settingsShow,
    chatRemoveConfirm,
    contextIdForDel,
    isInstalledManager,
    managerInstallConfirm,
    contextIdForModify,
    chatModifyConfirm,
    newChatTitle,
    chatHistory,
    currentChatTitle,
    currentModel,
    userScrollSelf,
    themeMode,
} = storeToRefs(useIndexStore())

/* const chartPopSelectOptions = ref<{ label: string, value: string }[]>([
    { label: $t("删除对话"), value: "delChat" },
    { label: $t("修改标题"), value: "modifyTitle" }
]) */

/**
 * @description 计算不同模式下logo的图片
 */

const logo = computed(() => {
    if (themeMode.value == "light") {
        return logoImage
    } else {
        return logoDark
    }
})

/**
 * @description 获取历史对话列表
 */
get_chat_list()


/**
 * @description 选择已有对话
 */
async function handleChoose(e: MouseEvent, chat: ChatItemInfo) {
    if ((e.target! as HTMLElement).classList.contains("i-common:more-operation")) {
        return
    } else {
        userScrollSelf.value = false
        await get_chat_list()
        currentContextId.value = chat.context_id
        currentChatTitle.value = chat.title
        currentModel.value = `${chat.model}:${chat.parameters}`
        getChatInfo(currentContextId.value)
    }
}


/**
 * @description 创建对话
 */
function createNewComu() {
    if (currentContextId.value == "") return
    // chatList.value.push({
    //     contextPath: "",
    //     context_id: "",
    //     model: "",
    //     parameters: "",
    //     title: "新对话"
    // })
    currentContextId.value = ""
    currentChatTitle.value = $t("新对话")
    chatHistory.value = new Map()
}

/**
 * @description 对话操作
 */
function doChatOperateSelect(val: string, context_id: string) {
    if (val == "delChat") {
        contextIdForDel.value = context_id
        chatRemoveConfirm.value = true
    } else if (val == "modifyTitle") {
        contextIdForModify.value = context_id
        newChatTitle.value = ""
        chatModifyConfirm.value = true
    }
}

/**
 * @description 折叠侧边栏
 */
function doFold() {
    siderWidth.value = 0
    isFold.value = true
}

/**
 * @description 删除指定对话
 */
function doChatDel(contextId: string) {
    contextIdForDel.value = contextId
    chatRemoveConfirm.value = true
}

/**
 * @description 模型管理
 */
function openModelManage() {
    settingsShow.value = true
    if (!isInstalledManager.value) {
        managerInstallConfirm.value = true
    }
}

/**
 * @description 切换模式
 */
function changeThemeMode(val: string) {
    themeMode.value = val
    Storage.themeMode = val
}

</script>

<style scoped lang="scss">
.logo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: var(--bt-mg-small) 0 var(--bt-mg-small) 5px;

    .logo-left {
        display: flex;
        gap: 10px;
        justify-content: flex-start;
        align-items: center;

        span {
            font-size: 26px;
            font-weight: bold;
        }
    }

    //TODO: 用例代码，后续删除
    // font-size: 18px;
    // height: 50px;
    // padding: var(--bt-pd-small);
    // box-sizing: border-box;
    // font-weight: bold;
}

.sider-wrapper {
    --hover-bg: #e3e3e3;
    --item-height: 34px;
    --item-border-radius: 10px;

    box-sizing: border-box;
    padding: var(--bt-pd-small);
    display: flex;
    gap: var(--bt-mg-normal);
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    height: calc(100% - 70px);

    .sider-top {
        width: 100%;

        .recent-comunication {
            width: 100%;

            .recent-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: var(--bt-mg-small) 0;
                box-sizing: border-box;
                padding: 0 5px 0 var(--bt-pd-small);
            }

            .recent-list {
                box-sizing: border-box;
                margin-top: var(--bt-mg-small);

                li {
                    height: var(--item-height);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: .2s;
                    cursor: pointer;
                    margin-bottom: 5px;

                    &:hover {
                        background-color: rgba(22, 163, 74, .1);
                    }

                    &.active {
                        background-color: rgba(22, 163, 74, .1);
                    }

                    .comu-title {
                        width: 200px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                .pd-10 {
                    padding: 0 0 0 var(--bt-pd-small);
                    width: 100%;
                    text-align: left;

                    :deep(.n-button__content) {
                        align-items: flex-start;
                    }
                }
            }
        }
    }

    .sider-bottom {
        width: 100%;

        .sider-divider {
            height: 1px;
            width: calc(100% - var(--bt-pd-normal)*2);
            background-color: rgba(0, 0, 0, .12);
            margin: var(--bt-mg-small) auto;
        }

        .create-comunication {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 10px;
            padding-left: 9px;
            text-align: left;
            height: var(--item-height);
            cursor: pointer;
            transition: .2s;

            &:hover {
                background-color: rgba(22, 163, 74, .1);
            }
        }
    }



    /* .search-comunication {
        position: relative;
        width: 100%;

        .search-icon {
            position: absolute;
            top: 8px;
            left: 4px;
        }

        :deep(.search-input) {
            --n-border:none !important;
            --n-placeholder-color:#727272 !important;
            height: var(--item-height);
            outline: none !important;
            border-radius: 8px;
            background-color: #F3F4F6;
            text-indent: 18px;
            line-height: 30px;
        }
    } */


}


.modal-footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
    gap: 20px;
}
</style>