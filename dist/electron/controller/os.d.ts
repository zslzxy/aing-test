/**
 * OS Controller for Node.js backend - Electron-specific features removed
 * @class
 */
declare class OsController {
    /**
     * Get system information
     */
    getSystemInfo(): any;
    /**
     * Check if directory exists
     */
    checkDirectory(args: {
        path: string;
    }): any;
    /**
     * Read file as base64 (for images)
     */
    readFileAsBase64(args: {
        filePath: string;
        mimeType?: string;
    }): any;
    /**
     * Get directory contents
     */
    getDirectoryContents(args: {
        dirPath: string;
    }): any;
    /**
     * Create directory
     */
    createDirectory(args: {
        dirPath: string;
    }): any;
    /**
     * Get file stats
     */
    getFileStats(args: {
        filePath: string;
    }): any;
}
export default OsController;
