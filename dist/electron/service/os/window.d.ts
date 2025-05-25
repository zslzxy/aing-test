import { BrowserWindow, Notification } from 'electron';
/**
 * Window
 * @class
 */
declare class WindowService {
    myNotification: Notification | null;
    windows: {
        [key: string]: BrowserWindow;
    };
    constructor();
    /**
     * Create a new window
     */
    createWindow(args: {
        type: string;
        content: string;
        windowName: string;
        windowTitle: string;
    }): number;
    /**
     * Get window contents id
     */
    getWCid(args: {
        windowName: string;
    }): number;
    /**
     * Realize communication between two windows through the transfer of the main process
     */
    communicate(args: {
        receiver: string;
        content: any;
    }): void;
    /**
     * createNotification
     */
    createNotification(options: any, event: any): void;
}
declare const windowService: WindowService;
export { WindowService, windowService };
