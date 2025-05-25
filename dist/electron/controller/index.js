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
const public_1 = require("../class/public");
const path = __importStar(require("path"));
const log_1 = require("ee-core/log");
/**
 * index controller 类，用于处理主进程的语言相关逻辑
 * @class
 */
class IndexController {
    async get_version() {
        return public_1.pub.return_success(public_1.pub.lang("获取成功"), { version: public_1.pub.version() });
    }
    /**
     * 获取当前语言和支持的语言列表
     * @returns {Promise<Object>} 包含语言列表和当前语言的对象，封装在成功响应中返回
     */
    async get_languages() {
        try {
            // 构建 settings.json 文件的完整路径
            const settingsFilePath = path.resolve(public_1.pub.get_language_path(), 'settings.json');
            // 读取文件内容
            let fileContent = public_1.pub.read_file(settingsFilePath);
            // 如果文件内容为空，设置默认的语言列表内容
            if (!fileContent) {
                fileContent = `[
                    {
                        "name": "zh",
                        "google": "zh-cn",
                        "title": "简体中文",
                        "cn": "简体中文"
                    },
                    {
                        "name": "en",
                        "google": "en",
                        "title": "English",
                        "cn": "英语"
                    }
                ]`;
            }
            // 获取当前语言
            const currentLanguage = public_1.pub.get_language();
            // 解析文件内容为 JSON 格式
            const languages = JSON.parse(fileContent);
            const data = {
                languages,
                current: currentLanguage
            };
            // 返回成功响应
            return public_1.pub.return_success(public_1.pub.lang('获取成功'), data);
        }
        catch (error) {
            // 记录错误日志
            log_1.logger.error(public_1.pub.lang('获取语言列表时出错:'), error);
            // 返回错误响应
            return public_1.pub.return_error(public_1.pub.lang('获取失败'), error);
        }
    }
    /**
     * 设置当前语言
     * @param {Object} args - 参数对象
     * @param {string} args.language - 要设置的语言
     * @returns {Promise<Object>} 封装了设置成功信息的响应对象
     */
    async set_language(args) {
        try {
            const { language } = args;
            // 设置语言配置
            public_1.pub.C('language', language);
            // 记录日志
            log_1.logger.info(public_1.pub.lang('设置语言为: {}', language));
            // 定义需要清除的缓存键数组
            const cacheKeysToDelete = ['language', 'languages', 'lang_data', 'client_lang'];
            // 循环清除缓存
            cacheKeysToDelete.forEach(key => public_1.pub.cache_del(key));
            // 返回成功响应
            return public_1.pub.return_success(public_1.pub.lang('设置成功'), null);
        }
        catch (error) {
            // 记录错误日志
            log_1.logger.error(public_1.pub.lang('设置语言时出错:'), error);
            // 返回错误响应
            return public_1.pub.return_error(public_1.pub.lang('设置失败'), error);
        }
    }
    /**
     * 获取客户端语言包
     * @returns {Promise<Object>} 包含客户端语言包内容的对象，封装在成功响应中返回
     */
    async get_client_language() {
        try {
            return this.getLanguagePack('client');
        }
        catch (error) {
            // 记录错误日志
            log_1.logger.error(public_1.pub.lang('获取客户端语言包时出错:'), error);
            // 返回错误响应
            return public_1.pub.return_error(public_1.pub.lang('获取客户端语言包失败'), error);
        }
    }
    /**
     * 获取服务端语言包
     * @returns {Promise<Object>} 包含服务端语言包内容的对象，封装在成功响应中返回
     */
    async get_server_language() {
        try {
            return this.getLanguagePack('server');
        }
        catch (error) {
            // 记录错误日志
            log_1.logger.error(public_1.pub.lang('获取服务端语言包时出错:'), error);
            // 返回错误响应
            return public_1.pub.return_error(public_1.pub.lang('获取服务端语言包失败'), error);
        }
    }
    /**
     * 通用的获取语言包方法
     * @param {string} type - 语言包类型，如 'client' 或 'server'
     * @returns {Promise<Object>} 包含指定类型语言包内容的对象，封装在成功响应中返回
     */
    async getLanguagePack(type) {
        // 获取当前语言
        const currentLanguage = public_1.pub.get_language();
        // 构建当前语言对应的语言包文件路径
        const languageFilePath = path.resolve(public_1.pub.get_language_path(), `${currentLanguage}/${type}.json`);
        // 检查文件是否存在，如果不存在则使用默认的中文语言包路径
        const filePath = public_1.pub.is_file(languageFilePath) ? languageFilePath : path.resolve(public_1.pub.get_language_path(), `zh/${type}.json`);
        // 读取文件内容
        let fileContent = public_1.pub.read_file(filePath);
        // 如果文件内容为空，设置为空对象
        if (!fileContent) {
            fileContent = '{}';
        }
        // 解析文件内容为 JSON 格式
        const languagePack = JSON.parse(fileContent);
        // 返回成功响应
        return public_1.pub.return_success(languagePack, null);
    }
    /**
     * 选择目录 - 在纯后端模式下，此功能需要前端提供目录路径
     * @param args - 参数，包含folder路径
     */
    async select_folder(args) {
        const { folder } = args;
        if (!folder) {
            return public_1.pub.return_error(public_1.pub.lang('请提供目录路径'));
        }
        // 检查目录是否存在
        if (!public_1.pub.file_exists(folder)) {
            return public_1.pub.return_error(public_1.pub.lang('指定的目录不存在'));
        }
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang('选择成功'), {
            folder: folder
        });
    }
    /**
     * 接收前端错误日志，并写入到日志文件
     * @param args
     * @returns
     */
    async write_logs(args) {
        const { logs } = args;
        // 记录日志
        log_1.logger.error(logs);
        return public_1.pub.return_success(public_1.pub.lang('写入成功'));
    }
    /**
     * 获取数据保存路径
     * @returns {Promise<any>} 返回成功响应，包含数据保存路径
     */
    async get_data_save_path() {
        let savePathConfigFile = path.resolve(public_1.pub.get_system_data_path(), 'save_path.json');
        if (!public_1.pub.file_exists(savePathConfigFile)) {
            let currentPath = public_1.pub.get_data_path();
            let config = {
                oldPath: '',
                currentPath: currentPath,
                isMove: false, // 是否要移动数据到新路径
                isMoveSuccess: false, // 是否移动成功
                isClearOldPath: false, // 是否已清除旧数据
                dataSize: 0, // 数据大小
                copyStatus: {
                    status: 0, // 0:未开始,1:正在复制,2:复制完成,-1:复制失败
                    speed: 0, // 复制速度
                    total: 0, // 总大小
                    current: 0, // 已复制大小
                    percent: 0, // 复制进度
                    startTime: 0, // 复制开始时间
                    endTime: 0, // 复制结束时间
                    fileTotal: 0, // 复制文件总数
                    fileCurrent: 0, // 复制文件当前数量
                    message: '', // 复制信息
                    error: '', // 复制错误信息
                }
            };
            public_1.pub.write_json(savePathConfigFile, config);
        }
        let savePathConfig = public_1.pub.read_json(savePathConfigFile);
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), savePathConfig);
    }
    /**
     * 设置数据保存路径
     * @param args - 参数对象
     * @returns {Promise<any>} 返回成功响应，包含设置结果
     */
    async set_data_save_path(args) {
        if (global.isOptimizeAllTable) {
            return public_1.pub.return_error(public_1.pub.lang('当前正在执行向量数据优化操作，请等待几分钟后再试'));
        }
        if (global.isCopyDataPath) {
            return public_1.pub.return_error(public_1.pub.lang('正在复制数据，请稍后再试'));
        }
        let { newPath } = args;
        if (!newPath) {
            return public_1.pub.return_error(public_1.pub.lang('请选择目录'));
        }
        if (!public_1.pub.file_exists(newPath)) {
            return public_1.pub.return_error(public_1.pub.lang('指定的目录不存在'));
        }
        // 检查指定目录是否为空目录
        let files = public_1.pub.readdir(newPath);
        if (files.length > 0) {
            return public_1.pub.return_error(public_1.pub.lang('指定的目录不是空目录'));
        }
        let savePathConfigFile = path.resolve(public_1.pub.get_system_data_path(), 'save_path.json');
        if (!public_1.pub.file_exists(savePathConfigFile)) {
            return public_1.pub.return_error(public_1.pub.lang('配置文件不存在，请先调用获取数据保存路径接口'));
        }
        let savePathConfig = public_1.pub.read_json(savePathConfigFile);
        // 设置新的数据保存路径
        savePathConfig.oldPath = savePathConfig.currentPath;
        savePathConfig.currentPath = newPath;
        savePathConfig.isMove = true;
        savePathConfig.isMoveSuccess = false;
        savePathConfig.copyStatus.status = 0;
        savePathConfig.copyStatus.speed = 0;
        savePathConfig.copyStatus.total = 0;
        savePathConfig.copyStatus.current = 0;
        savePathConfig.copyStatus.percent = 0;
        savePathConfig.copyStatus.startTime = 0;
        savePathConfig.copyStatus.endTime = 0;
        savePathConfig.copyStatus.fileTotal = 0;
        savePathConfig.copyStatus.fileCurrent = 0;
        savePathConfig.copyStatus.message = '';
        savePathConfig.copyStatus.error = '';
        public_1.pub.write_json(savePathConfigFile, savePathConfig);
        global.changePath = true;
        // 返回成功响应
        return public_1.pub.return_success(public_1.pub.lang('设置成功,正在复制数据，请稍后查看进度'));
    }
}
/**
 * 重写 IndexController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
IndexController.toString = () => '[class IndexController]';
// 导出 IndexController 类的实例
exports.default = new IndexController();
//# sourceMappingURL=index.js.map