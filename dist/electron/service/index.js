"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexService = exports.IndexService = void 0;
const public_1 = require("../class/public");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
// 定义模型服务类
class IndexService {
    // 递归列出目录下所有文件
    listFiles(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                results = results.concat(this.listFiles(filePath)); // 递归调用
            }
            else {
                results.push(filePath);
            }
        }
        return results;
    }
    /**
     * 复制数据到新路径
     * @returns
     */
    async copyDataPath() {
        if (global.isCopyDataPath) {
            return;
        }
        global.isCopyDataPath = true;
        // 复制数据到新路径
        let savePathConfigFile = path.resolve(public_1.pub.get_system_data_path(), 'save_path.json');
        let savePathConfig = public_1.pub.read_json(savePathConfigFile);
        try {
            let oldPath = savePathConfig.oldPath;
            let newPath = savePathConfig.currentPath;
            savePathConfig.copyStatus.status = 1;
            savePathConfig.copyStatus.startTime = public_1.pub.time();
            savePathConfig.copyStatus.total = public_1.pub.getDirSize(oldPath);
            public_1.pub.write_json(savePathConfigFile, savePathConfig);
            let files = this.listFiles(oldPath);
            savePathConfig.copyStatus.fileTotal = files.length;
            savePathConfig.copyStatus.fileCurrent = 0;
            let lastTime = public_1.pub.time();
            let lastCurrent = 0;
            for (let filename of files) {
                let newFilename = filename.replace(oldPath, newPath);
                let dstPath = path.dirname(newFilename);
                let name = path.basename(newFilename);
                if (!public_1.pub.file_exists(dstPath)) {
                    public_1.pub.mkdir(dstPath);
                }
                let fStat = public_1.pub.stat(filename);
                savePathConfig.copyStatus.fileCurrent++;
                savePathConfig.copyStatus.message = public_1.pub.lang('正在复制文件: {}', name);
                savePathConfig.copyStatus.error = '';
                await fs.copyFile(filename, newFilename);
                savePathConfig.copyStatus.current += fStat.size;
                lastCurrent += fStat.size;
                savePathConfig.copyStatus.percent = Math.floor(savePathConfig.copyStatus.current / savePathConfig.copyStatus.total * 100);
                if (public_1.pub.time() != lastTime) {
                    savePathConfig.copyStatus.speed = lastCurrent;
                    lastTime = public_1.pub.time();
                    lastCurrent = 0;
                }
                public_1.pub.write_json(savePathConfigFile, savePathConfig);
            }
            // 删除旧数据
            if (savePathConfig.oldPath != newPath && savePathConfig.oldPath) {
                if (public_1.pub.file_exists(oldPath)) {
                    savePathConfig.copyStatus.message = public_1.pub.lang('正在删除旧数据');
                    public_1.pub.write_json(savePathConfigFile, savePathConfig);
                    await fs.rmdir(oldPath, { recursive: true });
                    savePathConfig.isClearOldPath = true;
                }
            }
            savePathConfig.isMoveSuccess = true;
            savePathConfig.isMove = false;
            savePathConfig.copyStatus.status = 2;
            savePathConfig.copyStatus.endTime = public_1.pub.time();
            savePathConfig.copyStatus.message = public_1.pub.lang('复制完成');
            savePathConfig.copyStatus.error = '';
        }
        catch (e) {
            let rmPath = savePathConfig.currentPath;
            savePathConfig.copyStatus.status = -1;
            savePathConfig.copyStatus.message = public_1.pub.lang('复制失败，已撤回操作: {}', e.message);
            savePathConfig.currentPath = savePathConfig.oldPath;
            savePathConfig.isMove = false;
            savePathConfig.oldPath = '';
            savePathConfig.isMoveSuccess = false;
            savePathConfig.copyStatus.error = e.message;
            // 删除已复制的文件
            fs.rmdir(rmPath, { recursive: true });
        }
        finally {
            public_1.pub.write_json(savePathConfigFile, savePathConfig);
            global.isCopyDataPath = false;
        }
    }
}
exports.IndexService = IndexService;
// 重写 toString 方法，方便调试和日志输出
IndexService.toString = () => '[class IndexService]';
// 创建 IndexService 实例
const indexService = new IndexService();
exports.indexService = indexService;
//# sourceMappingURL=index.js.map