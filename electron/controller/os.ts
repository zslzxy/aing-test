import fs from 'fs';
import path from 'path';
import os from 'os';
import { pub } from '../class/public';

/**
 * OS Controller for Node.js backend - Electron-specific features removed
 * @class
 */
class OsController {

  /**
   * Get system information
   */
  getSystemInfo(): any {
    return pub.return_success('获取系统信息成功', {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime()
    });
  }

  /**
   * Check if directory exists
   */
  checkDirectory(args: { path: string }): any {
    const { path: dirPath } = args;
    if (!dirPath) {
      return pub.return_error('请提供目录路径');
    }

    try {
      const exists = fs.existsSync(dirPath);
      const isDirectory = exists ? fs.statSync(dirPath).isDirectory() : false;
      
      return pub.return_success('检查完成', {
        exists,
        isDirectory,
        path: dirPath
      });
    } catch (error) {
      return pub.return_error('检查目录时出错', error);
    }
  }

  /**
   * Read file as base64 (for images)
   */
  readFileAsBase64(args: { filePath: string; mimeType?: string }): any {
    const { filePath, mimeType = 'image/jpeg' } = args;
    
    if (!filePath) {
      return pub.return_error('请提供文件路径');
    }

    if (!fs.existsSync(filePath)) {
      return pub.return_error('文件不存在');
    }
    
    try {
      const data = fs.readFileSync(filePath);
      const base64 = `data:${mimeType};base64,` + data.toString('base64');
      
      return pub.return_success('读取文件成功', {
        base64,
        size: data.length,
        path: filePath
      });
    } catch (error) {
      return pub.return_error('读取文件时出错', error);
    }
  }

  /**
   * Get directory contents
   */
  getDirectoryContents(args: { dirPath: string }): any {
    const { dirPath } = args;
    
    if (!dirPath) {
      return pub.return_error('请提供目录路径');
    }

    if (!fs.existsSync(dirPath)) {
      return pub.return_error('目录不存在');
    }

    try {
      const items = fs.readdirSync(dirPath).map(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        return {
          name: item,
          path: itemPath,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          size: stats.size,
          modified: stats.mtime
        };
      });

      return pub.return_success('获取目录内容成功', {
        path: dirPath,
        items
      });
    } catch (error) {
      return pub.return_error('读取目录时出错', error);
    }
  }

  /**
   * Create directory
   */
  createDirectory(args: { dirPath: string }): any {
    const { dirPath } = args;
    
    if (!dirPath) {
      return pub.return_error('请提供目录路径');
    }

    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return pub.return_success('创建目录成功', { path: dirPath });
    } catch (error) {
      return pub.return_error('创建目录时出错', error);
    }
  }

  /**
   * Get file stats
   */
  getFileStats(args: { filePath: string }): any {
    const { filePath } = args;
    
    if (!filePath) {
      return pub.return_error('请提供文件路径');
    }

    if (!fs.existsSync(filePath)) {
      return pub.return_error('文件不存在');
    }

    try {
      const stats = fs.statSync(filePath);
      
      return pub.return_success('获取文件信息成功', {
        path: filePath,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      });
    } catch (error) {
      return pub.return_error('获取文件信息时出错', error);
    }
  }
}
OsController.toString = () => '[class OsController]';

export default OsController;