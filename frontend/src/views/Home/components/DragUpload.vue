<template>
    <n-upload multiple directory-dnd  :max="5">
        <n-upload-dragger class="drag-area">
            <div class="drag-notice">
                <i class="i-tdesign:folder-add w-60 h-60"></i>
                <span>拖动文档到此处上传到知识库</span>
                <span class="text-[#909399]">文件支持类型: PDF, DOC, DOCX, JPEG, PNG, JPG</span>
            </div>
        </n-upload-dragger>
    </n-upload>
</template>

<script setup lang="ts">
import { NUpload, NUploadDragger } from 'naive-ui';
</script>

<style scoped lang="scss">
@use "@/assets/base";
.drag-area {
    width: 100%;
    height: 100vh;
    // background-color: rgba(0, 0, 0, .5);
    // color: #f7f7f7;
    @include base.column-flex-center;
    .drag-notice {
        @include base.column-flex-center;
    }
}
</style>