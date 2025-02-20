<template>
  <NConfigProvider :theme="themeMode == 'light' ? lightTheme : darkTheme">
    <router-view></router-view>
  </NConfigProvider>
</template>

<script setup lang="ts">
import useIndexStore from './views/Home/store';
import { storeToRefs } from 'pinia';
import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';
const { themeMode } = storeToRefs(useIndexStore())
</script>

<style scoped></style>