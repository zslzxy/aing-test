"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const public_1 = require("../class/public");
/**
 * OS Controller for Node.js backend - Electron-specific features removed
 * @class
 */
class OsController {
    /**
     * Get system information
     */
    getSystemInfo() {
        return public_1.pub.return_success('获取系统信息成功', {
            platform: os_1.default.platform(),
            arch: os_1.default.arch(),
            release: os_1.default.release(),
            hostname: os_1.default.hostname(),
            cpus: os_1.default.cpus().length,
            totalMemory: os_1.default.totalmem(),
            freeMemory: os_1.default.freemem(),
            uptime: os_1.default.uptime()
        });
    }
    /**
     * Check if directory exists
     */
    checkDirectory(args) {
        const { path: dirPath } = args;
        if (!dirPath) {
            return public_1.pub.return_error('请提供目录路径');
        }
        try {
            const exists = fs_1.default.existsSync(dirPath);
            const isDirectory = exists ? fs_1.default.statSync(dirPath).isDirectory() : false;
            return public_1.pub.return_success('检查完成', {
                exists,
                isDirectory,
                path: dirPath
            });
        }
        catch (error) {
            return public_1.pub.return_error('检查目录时出错', error);
        }
    }
    /**
     * Read file as base64 (for images)
     */
    readFileAsBase64(args) {
        const { filePath, mimeType = 'image/jpeg' } = args;
        if (!filePath) {
            return public_1.pub.return_error('请提供文件路径');
        }
        if (!fs_1.default.existsSync(filePath)) {
            return public_1.pub.return_error('文件不存在');
        }
        try {
            const data = fs_1.default.readFileSync(filePath);
            const base64 = `data:${mimeType};base64,` + data.toString('base64');
            return public_1.pub.return_success('读取文件成功', {
                base64,
                size: data.length,
                path: filePath
            });
        }
        catch (error) {
            return public_1.pub.return_error('读取文件时出错', error);
        }
    }
    /**
     * Get directory contents
     */
    getDirectoryContents(args) {
        const { dirPath } = args;
        if (!dirPath) {
            return public_1.pub.return_error('请提供目录路径');
        }
        if (!fs_1.default.existsSync(dirPath)) {
            return public_1.pub.return_error('目录不存在');
        }
        try {
            const items = fs_1.default.readdirSync(dirPath).map(item => {
                const itemPath = path_1.default.join(dirPath, item);
                const stats = fs_1.default.statSync(itemPath);
                return {
                    name: item,
                    path: itemPath,
                    isDirectory: stats.isDirectory(),
                    isFile: stats.isFile(),
                    size: stats.size,
                    modified: stats.mtime
                };
            });
            return public_1.pub.return_success('获取目录内容成功', {
                path: dirPath,
                items
            });
        }
        catch (error) {
            return public_1.pub.return_error('读取目录时出错', error);
        }
    }
    /**
     * Create directory
     */
    createDirectory(args) {
        const { dirPath } = args;
        if (!dirPath) {
            return public_1.pub.return_error('请提供目录路径');
        }
        try {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
            return public_1.pub.return_success('创建目录成功', { path: dirPath });
        }
        catch (error) {
            return public_1.pub.return_error('创建目录时出错', error);
        }
    }
    /**
     * Get file stats
     */
    getFileStats(args) {
        const { filePath } = args;
        if (!filePath) {
            return public_1.pub.return_error('请提供文件路径');
        }
        if (!fs_1.default.existsSync(filePath)) {
            return public_1.pub.return_error('文件不存在');
        }
        try {
            const stats = fs_1.default.statSync(filePath);
            return public_1.pub.return_success('获取文件信息成功', {
                path: filePath,
                size: stats.size,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime
            });
        }
        catch (error) {
            return public_1.pub.return_error('获取文件信息时出错', error);
        }
    }
}
OsController.toString = () => '[class OsController]';
exports.default = OsController;
//# sourceMappingURL=os.js.map