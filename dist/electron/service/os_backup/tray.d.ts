import { Tray } from 'electron';
/**
 * 托盘
 * @class
 */
declare class TrayService {
    tray: Tray | null;
    config: {
        title: string;
        icon: string;
    };
    constructor();
    /**
     * Create the tray icon
     */
    create(): void;
}
declare const trayService: TrayService;
export { trayService };
