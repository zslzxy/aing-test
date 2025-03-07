<template>
    <div class="upload-wrapper">
        <div class="mode-choose" v-if="chooseList.length == 0">
            <NRadioGroup v-model:value="uploadMode">
                <NRadio value="file">{{ $t("上传文件") }}</NRadio>
                <NRadio value="dir">{{ $t("上传文件夹") }}</NRadio>
            </NRadioGroup>
        </div>
        <div :class="['upload-area-wrapper', { 'wait': chooseList.length == 0 }]">
            <input type="file" @change="handleFileChange" multiple :webkitdirectory="uploadMode == 'dir'"
                ref="fileUpload" style="display: none" :accept="acceptFileType" />
            <div class="upload-area" v-if="chooseList.length == 0" @click="chooseFiles" ref="dragAreaRef">
                <i class="i-tdesign:folder-add w-40 h-40"></i>
                <NButton type="primary">{{ $t("点击上传") }}</NButton>
                <div class="text-[#909399] flex justify-center flex-col px-5">
                    {{ $t("文件支持类型") }}: 
                    <div class="flex flex-wrap">
                        <span v-for="item in fileType" :key="item" type="default" style="margin:0 5px">.{{ item }}</span>
                    </div>
                </div>
            </div>
            <NScrollbar style="min-height: 200px; max-height: 600px;" v-else>
                <NList hoverable>
                    <NListItem v-for="item in chooseList" :key="item">
                        <div class="file-list-item">
                            <span>{{ item.name }}</span>
                            <i class="i-ri:close-circle-line w-20 h-20 text-[#909399]" @click="removeFile(item)"></i>
                        </div>
                    </NListItem>
                </NList>
            </NScrollbar>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import useIndexStore from '../store';
import { NRadio, NRadioGroup, NList, NListItem, NScrollbar, NButton,NTag } from 'naive-ui';
import { ref, onMounted } from 'vue';
import { message } from '@/utils/naive-tools';
const fileUpload = ref<HTMLInputElement>()
const { uploadMode, fileOrDirList, chooseList } = storeToRefs(useIndexStore());
import i18n from '@/lang';
const $t = i18n.global.t;
/**
 * @description 判断文件类型
 */
const fileType: string[] = [
    "docx",
    "doc",
    "xlsx",
    "xls",
    "csv",
    "pptx",
    "ppt",
    "pdf",
    "html",
    "htm",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "md",
    "markdown",
    "txt",
    "log",
    "text",
    "conf",
    "cfg",
    "ini",
    "json",
]
// 生成文件选择限制范围
const acceptFileType = fileType.reduce((p, v) => {
    return p + `.${v},`
}, "")
// 
function fileTypeCheck(file: File) {
    const suffix = file.name.split('.').pop()?.toLowerCase()
    return fileType.includes(suffix!)
}

/***
 * @description 选择文件的回调
 */
function handleFileChange() {
    for (let file of fileUpload.value!.files!) {
        if (!fileTypeCheck(file)) {
            // message.error(`${$t("{0}的文件类型不支持", [file.name])}`)
            // return
            continue;
        }
        chooseList.value.push(file)
    }
    // chooseList.value = Array.from(fileUpload.value!.files!)
    for (let file of chooseList.value) {
        // @ts-ignore
        fileOrDirList.value.push(file.path)

    }
}

/**
 * @description 点击按钮进行文件选择
 */
function chooseFiles() {
    fileUpload.value!.click()
}



/**
 * @description 移除添加的文件
 */
function removeFile(item: any) {
    chooseList.value = chooseList.value.filter((i: any) => i.name != item.name)
    fileOrDirList.value = fileOrDirList.value.filter((i: any) => i != item.path)
}



/********** 拖拽上传业务逻辑——预测试 **********/
const dragAreaRef = ref<HTMLDivElement | null>()

function dragUploadInit() {
    let dragEnterCount = 0;
    // 在 document 上监听 dragenter 事件
    dragAreaRef.value?.addEventListener('dragenter', function (event) {
        event.preventDefault();
        dragEnterCount++;
        console.log(event)
        if (dragEnterCount === 1) {
            // 显示遮罩层
            // knowledgeDragable.value = true;
            // console.log("拖进来了")
        }
    });

    // 在 document 上监听 dragover 事件
    dragAreaRef.value?.addEventListener('dragover', function (event) {
        // 阻止默认行为，允许放置
        event.preventDefault();
    });

    // 在 document 上监听 dragleave 事件
    dragAreaRef.value?.addEventListener('dragleave', function (event) {
        event.preventDefault();
        dragEnterCount--;
        if (dragEnterCount === 0) {
            // 隐藏遮罩层
            // knowledgeDragable.value = false;
            // console.log("拖出去了")
        }
    });

    // 处理drop事件
    dragAreaRef.value?.addEventListener('drop', function (event) {
        event.preventDefault();
        dragEnterCount = 0;

        // 处理拖放的文件
        if (event.dataTransfer?.items) {
            // 使用 DataTransferItemList 接口处理文件夹
            const items = event.dataTransfer.items;
            for (let i = 0; i < items.length; i++) {

                const item = items[i];
                console.log(item)
                // 如果是文件夹
                if (item.webkitGetAsEntry && item.webkitGetAsEntry()!.isDirectory) {
                    console.log("检测到文件夹");
                    // 使用 webkitdirectory 属性触发文件输入
                    if (uploadMode.value !== 'dir') {
                        uploadMode.value = 'dir';
                    }

                    // fileUpload.value?.click();
                    return;
                }
            }
            // 如果是单个文件
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (!fileTypeCheck(file)) {
                        message.error(`${file.name}的文件类型不支持`);
                        return;
                    }
                }
                chooseList.value = files;
                for (let i = 0; i < files.length; i++) {
                    // @ts-ignore - 针对Electron环境
                    fileOrDirList.value.push(files[i].path);
                }
            }
        }
    });
}

onMounted(() => {
    // dragUploadInit()
})
</script>

<style scoped lang="scss">
@use "@/assets/base";

.upload-wrapper {
    .mode-choose {
        @include base.row-flex-between;
        justify-content: flex-start;
        margin-top: 20px;
    }

    .upload-area-wrapper {
        margin-top: 20px;
        width: 100%;
        min-height: 260px;
        max-height: 600px;
        cursor: pointer;


        &.wait {
            @include base.column-flex-center;
            background: rgb(232.8, 233.4, 234.6);
            align-items: center;
        }

        .upload-area {
            @include base.column-flex-center;
            justify-content: flex-start;
        }
    }
}

.file-list-item {
    width: 100%;
    @include base.row-flex-between;
}
</style>