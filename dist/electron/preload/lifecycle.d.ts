declare class Lifecycle {
    /**
     * Core app has been loaded
     */
    ready(): Promise<void>;
    /**
     * Electron app is ready
     */
    electronAppReady(): Promise<void>;
    /**
     * Main window has been loaded
     */
    windowReady(): Promise<void>;
    /**
     * Before app close
     */
    beforeClose(): Promise<void>;
}
export { Lifecycle };
