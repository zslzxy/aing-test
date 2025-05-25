"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trayService = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const ps_1 = require("ee-core/ps");
const log_1 = require("ee-core/log");
const electron_2 = require("electron");
const electron_3 = require("ee-core/electron");
const public_1 = require("../../class/public");
/**
 * 托盘
 * @class
 */
class TrayService {
    tray;
    config;
    constructor() {
        this.tray = null;
        this.config = {
            title: 'AingDesk',
            icon: '/public/images/tray.png',
        };
    }
    /**
     * Create the tray icon
     */
    create() {
        log_1.logger.info('[tray] load');
        const cfg = this.config;
        const mainWindow = (0, electron_3.getMainWindow)();
        // tray icon
        const iconPath = path_1.default.join((0, ps_1.getBaseDir)(), cfg.icon);
        // Tray menu items
        const trayMenuTemplate = [
            {
                label: public_1.pub.lang('显示'),
                click: function () {
                    mainWindow.show();
                }
            },
            {
                label: public_1.pub.lang('退出'),
                click: function () {
                    electron_2.app.quit();
                }
            }
        ];
        // 设置关闭行为
        // setCloseAndQuit(true);
        mainWindow.on('close', (event) => {
            // if (getCloseAndQuit()) {
            //   return;
            // }
            // mainWindow.hide();
            // event.preventDefault();
            electron_2.app.quit();
        });
        // Initialize the tray
        this.tray = new electron_1.Tray(iconPath);
        this.tray.setToolTip(cfg.title);
        const contextMenu = electron_1.Menu.buildFromTemplate(trayMenuTemplate);
        this.tray.setContextMenu(contextMenu);
        // Show the main window when the tray icon is clicked
        this.tray.on('click', () => {
            mainWindow.show();
        });
    }
}
TrayService.toString = () => '[class TrayService]';
const trayService = new TrayService();
exports.trayService = trayService;
//# sourceMappingURL=tray.js.map