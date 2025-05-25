"use strict";
/*
 * 如果启用了上下文隔离，渲染进程无法使用electron的api，
 * 可通过contextBridge 导出api给渲染进程使用
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ele = {
    ipcRenderer: electron_1.ipcRenderer,
};
electron_1.contextBridge.exposeInMainWorld('electron', ele);
//# sourceMappingURL=bridge.js.map