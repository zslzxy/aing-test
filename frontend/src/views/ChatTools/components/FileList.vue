<template>
    <div class="upload-file-list" v-if="questionFiles.length">
        <div class="file-item" v-for="(item, index) in questionFileList" :key="index">
            <i class="i-tdesign:close-circle-filled w-18 h-18 cursor-pointer del-file text-red5"
                @click="removeFile(index)"></i>
            <n-image :src="pdf" width="40px" preview-disabled />
            <n-tooltip trigger="hover">
                <template #trigger>
                    <span class="show-tit">{{ item }}</span>
                </template>
                <span>{{ item }}</span>
            </n-tooltip>
        </div>
    </div>
    <div class="upload-file-list" v-if="questionImageList.length">
        <div class="file-item" v-for="(item, index) in questionImageList" :key="index">
            <i class="i-tdesign:close-circle-filled w-18 h-18 cursor-pointer del-file text-red5"
                @click="removeImage(index)"></i>
            <n-image :src="questionImages[index]" width="40px" />
        </div>
    </div>
</template>

<script setup lang="ts">
import pdf from "@/assets/images/PDF.png"
import { getChatToolsStoreData } from '../store';
import { removeImage, removeFile } from "@/views/ChatTools/controller";

const {
    questionFiles,
    questionFileList,
    questionImageList,
    questionImages
} = getChatToolsStoreData();
</script>

<style scoped lang="scss">
@use "@/assets/base";

.upload-file-list {
    box-sizing: border-box;
    padding: 10px;
    background: base.$gray-2;
    @include base.row-flex-between;
    justify-content: flex-start;

    .file-item {
        @include base.file-item;
    }
}
</style>