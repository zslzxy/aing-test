"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ee_core_1 = require("ee-core");
const lifecycle_1 = require("./preload/lifecycle");
const preload_1 = require("./preload");
const total_1 = require("./service/total");
// New app
const app = new ee_core_1.ElectronEgg();
// Register lifecycle
const life = new lifecycle_1.Lifecycle();
app.register("ready", life.ready);
app.register("electron-app-ready", life.electronAppReady);
app.register("window-ready", life.windowReady);
app.register("before-close", life.beforeClose);
// Register preload
app.register("preload", preload_1.preload);
// Register service
setTimeout(() => {
    // 分享服务
    const { shareService } = require('./service/share');
    const { mcpService } = require('./service/mcp');
    const shareIdPrefix = shareService.generateUniquePrefix();
    let socket = shareService.connectToCloudServer(shareIdPrefix);
    shareService.startReconnect(socket, shareIdPrefix);
    // RAG后台任务
    const { RagTask } = require('./rag/rag_task');
    let ragTaskObj = new RagTask();
    ragTaskObj.parseTask();
    // 创建索引
    ragTaskObj.switchToCosineIndex();
    // 同步MCP服务器列表
    mcpService.sync_cloud_mcp();
}, 1000);
// 启动统计服务
total_1.totalService.start();
// Run
app.run();
//# sourceMappingURL=main.js.map