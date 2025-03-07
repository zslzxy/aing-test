<template>
  <NConfigProvider :theme="themeMode == 'light' ? lightTheme : darkTheme">
    <router-view></router-view>
  </NConfigProvider>
  <!-- <div class="drag-upload" v-show="knowledgeDragable">
    <DragUpload />
  </div> -->
</template>

<script setup lang="ts">
import useIndexStore from './views/Home/store';
import { storeToRefs } from 'pinia';
import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';
import DragUpload from './views/Home/components/DragUpload.vue';
import { ragStatus } from './views/Home/controller';
const { themeMode, knowledgeDragable } = storeToRefs(useIndexStore())

// 检测知识库状态
ragStatus()


/********** 拖拽上传 **********/
// let dragEnterCount = 0;
// // 在 document 上监听 dragenter 事件
// document.addEventListener('dragenter', (event) => {
//   event.preventDefault();
//   dragEnterCount++;
//   console.log(dragEnterCount)
//   if (dragEnterCount === 1) {
//     // 显示遮罩层
//     knowledgeDragable.value = true;
//   }
// });

// // 在 document 上监听 dragover 事件
// document.addEventListener('dragover', (event) => {
//   // 阻止默认行为，允许放置
//   event.preventDefault();
// });

// // 在 document 上监听 dragleave 事件
// document.addEventListener('dragleave', (event) => {
//   dragEnterCount--;
//   if (dragEnterCount === 0) {
//     // 隐藏遮罩层
//     knowledgeDragable.value = false;
//   }
// });
</script>

<style scoped>
.drag-upload {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
}
</style>