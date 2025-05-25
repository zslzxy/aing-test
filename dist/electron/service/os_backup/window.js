"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowService = exports.WindowService = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const electron_2 = require("ee-core/electron");
const ps_1 = require("ee-core/ps");
const config_1 = require("ee-core/config");
const utils_1 = require("ee-core/utils");
const log_1 = require("ee-core/log");
/**
 * Window
 * @class
 */
class WindowService {
    myNotification;
    windows;
    constructor() {
        this.myNotification = null;
        this.windows = {};
    }
    /**
     * Create a new window
     */
    createWindow(args) {
        const { type, content, windowName, windowTitle } = args;
        let contentUrl = '';
        if (type == 'html') {
            contentUrl = path_1.default.join('file://', (0, ps_1.getBaseDir)(), content);
        }
        else if (type == 'web') {
            contentUrl = content;
        }
        else if (type == 'vue') {
            let addr = 'http://localhost:8080';
            if ((0, ps_1.isProd)()) {
                const { mainServer } = (0, config_1.getConfig)();
                if (mainServer && mainServer.protocol && (0, utils_1.isFileProtocol)(mainServer.protocol)) {
                    addr = mainServer.protocol + path_1.default.join((0, ps_1.getBaseDir)(), mainServer.indexPath);
                }
            }
            contentUrl = addr + content;
        }
        log_1.logger.info('[createWindow] url: ', contentUrl);
        const opt = {
            title: windowTitle,
            x: 10,
            y: 10,
            width: 980,
            height: 650,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
            },
        };
        const win = new electron_1.BrowserWindow(opt);
        const winContentsId = win.webContents.id;
        win.loadURL(contentUrl);
        win.webContents.openDevTools();
        this.windows[windowName] = win;
        return winContentsId;
    }
    /**
     * Get window contents id
     */
    getWCid(args) {
        const { windowName } = args;
        let win;
        if (windowName == 'main') {
            win = (0, electron_2.getMainWindow)();
        }
        else {
            win = this.windows[windowName];
        }
        return win.webContents.id;
    }
    /**
     * Realize communication between two windows through the transfer of the main process
     */
    communicate(args) {
        const { receiver, content } = args;
        if (receiver == 'main') {
            const win = (0, electron_2.getMainWindow)();
            win.webContents.send('controller/os/window2ToWindow1', content);
        }
        else if (receiver == 'window2') {
            const win = this.windows[receiver];
            win.webContents.send('controller/os/window1ToWindow2', content);
        }
    }
    /**
     * createNotification
     */
    createNotification(options, event) {
        const channel = 'controller/os/sendNotification';
        this.myNotification = new electron_1.Notification(options);
        if (options.clickEvent) {
            this.myNotification.on('click', () => {
                let data = {
                    type: 'click',
                    msg: '您点击了通知消息'
                };
                event.reply(`${channel}`, data);
            });
        }
        if (options.closeEvent) {
            this.myNotification.on('close', () => {
                let data = {
                    type: 'close',
                    msg: '您关闭了通知消息'
                };
                event.reply(`${channel}`, data);
            });
        }
        this.myNotification.show();
    }
}
exports.WindowService = WindowService;
WindowService.toString = () => '[class WindowService]';
const windowService = new WindowService();
exports.windowService = windowService;
//# sourceMappingURL=window.js.map