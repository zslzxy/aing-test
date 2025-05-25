"use strict";
/**
 * Preload module, this file will be loaded when the program starts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.preload = preload;
const log_1 = require("ee-core/log");
const tray_1 = require("../service/os/tray");
const security_1 = require("../service/os/security");
const auto_updater_1 = require("../service/os/auto_updater");
const mcp_1 = require("../service/mcp");
// import { cross } from 'ee-core/cross';
function preload() {
    // Example feature module, optional to use and modify
    log_1.logger.info('[preload] load 5');
    tray_1.trayService.create();
    security_1.securityService.create();
    auto_updater_1.autoUpdaterService.create();
    // cross.run('python')
    // 安装npx环境
    mcp_1.mcpService.install_npx();
}
//# sourceMappingURL=index.js.map