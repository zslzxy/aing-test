<template>
  <NConfigProvider :theme="themeMode == 'light' ? lightTheme : darkTheme" :theme-overrides="themeOverrides">
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
import { ragStatus,getVersion } from './views/Home/controller';
import storage from './utils/storage';
import { onMounted } from 'vue';
const { themeMode, knowledgeDragable,welcomeShow } = storeToRefs(useIndexStore())

// 检测知识库状态
ragStatus()
// 获取版本号
getVersion()

// 调整样式
const themeOverrides = {
  Switch: {
    // railWidthMedium: "20px",
    // railWidthSmall:"20px"
  }
}

// 判断是否出现欢迎界面
onMounted(()=>{
  if(storage.welcomeEnd == null){
    welcomeShow.value = true;
  }
})

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