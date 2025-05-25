"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lifecycle = void 0;
const log_1 = require("ee-core/log");
const config_1 = require("ee-core/config");
const electron_1 = require("ee-core/electron");
const public_1 = require("../class/public");
const menu_1 = require("../class/menu");
let WindowSize = { size: 0, position: 0 };
class Lifecycle {
    /**
     * Core app has been loaded
     */
    async ready() {
        log_1.logger.info('[lifecycle] ready');
    }
    /**
     * Electron app is ready
     */
    async electronAppReady() {
        log_1.logger.info('[lifecycle] electron-app-ready');
    }
    /**
     * Main window has been loaded
     */
    async windowReady() {
        log_1.logger.info('[lifecycle] window-ready');
        // Delay loading, no white screen
        const win = (0, electron_1.getMainWindow)();
        win.setMenu(null);
        let window = public_1.pub.C('window');
        if (window && window.size) {
            win.setSize(window.size[0], window.size[1]);
        }
        if (window && window.position) {
            win.setPosition(window.position[0], window.position[1]);
        }
        const config = (0, config_1.getConfig)();
        const { windowsOption } = config;
        if (windowsOption?.show === false) {
            win.once('ready-to-show', () => {
                win.show();
                win.focus();
            });
        }
        // 当调整窗口大小时，记录窗口大小
        win.on('resize', () => {
            // 全屏和最大化、最小化时不记录窗口大小
            if (win.isFullScreen() || win.isMaximized() || win.isMinimized())
                return;
            WindowSize.size = win.getSize();
            WindowSize.position = win.getPosition();
        });
        // 加载菜单
        win.webContents.on("context-menu", (event, params) => {
            let menu_obj = new menu_1.ContextMenu(event, params);
            let contextMenu = menu_obj.get_context_menu();
            if (contextMenu)
                contextMenu.popup({ window: win });
        });
        // 处理打开连接
        win.webContents.on('new-window', (event, url) => {
            event.preventDefault();
            require('electron').shell.openExternal(url);
        });
        // 处理连接跳转
        win.webContents.on('will-navigate', (event, url) => {
            event.preventDefault();
            require('electron').shell.openExternal(url);
        });
        // 拦截window.open
        win.webContents.setWindowOpenHandler((Details) => {
            const { url } = Details;
            if (url.startsWith('http')) {
                require('electron').shell.openExternal(url);
            }
            else {
                // 直接打开文件
                public_1.pub.openFile(decodeURIComponent(url.replace('file:///', '')));
            }
            return { action: 'deny' };
        });
    }
    /**
     * Before app close
     */
    async beforeClose() {
        log_1.logger.info('[lifecycle] before-close');
        // 保存窗口大小
        public_1.pub.C('window', WindowSize);
    }
}
exports.Lifecycle = Lifecycle;
Lifecycle.toString = () => '[class Lifecycle]';
//# sourceMappingURL=lifecycle.js.map