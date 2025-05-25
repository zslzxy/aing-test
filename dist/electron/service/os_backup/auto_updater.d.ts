/**
 * AutoUpdaterService class for automatic updates
 */
declare class AutoUpdaterService {
    private config;
    constructor();
    create(): void;
    /**
     * 检查更新
     */
    checkUpdate(): void;
    /**
     * 下载更新
     */
    download(): void;
    /**
     * 向前端发消息
     */
    sendStatusToWindow(content?: any): void;
    /**
     * 单位转换
     */
    bytesChange(limit: any): string;
}
declare const autoUpdaterService: AutoUpdaterService;
export { AutoUpdaterService, autoUpdaterService };
