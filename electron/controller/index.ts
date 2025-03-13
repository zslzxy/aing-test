import { pub } from '../class/public';
import * as path from 'path';
import { logger } from 'ee-core/log';

/**
 * index controller 类，用于处理主进程的语言相关逻辑
 * @class
 */
class IndexController {

    async get_version(): Promise<any> {
        return pub.return_success(pub.lang("获取成功"),{version:pub.version()});
    }

    /**
     * 获取当前语言和支持的语言列表
     * @returns {Promise<Object>} 包含语言列表和当前语言的对象，封装在成功响应中返回
     */
    async get_languages(): Promise<any> {
        try {
            // 构建 settings.json 文件的完整路径
            const settingsFilePath = path.resolve(pub.get_language_path(), 'settings.json');
            // 读取文件内容
            let fileContent = pub.read_file(settingsFilePath);

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
            const currentLanguage = pub.get_language();
            // 解析文件内容为 JSON 格式
            const languages = JSON.parse(fileContent);

            const data = {
                languages,
                current: currentLanguage
            };

            // 返回成功响应
            return pub.return_success(pub.lang('获取成功'), data);
        } catch (error) {
            // 记录错误日志
            logger.error(pub.lang('获取语言列表时出错:'), error);
            // 返回错误响应
            return pub.return_error(pub.lang('获取失败'), error);
        }
    }

    /**
     * 设置当前语言
     * @param {Object} args - 参数对象
     * @param {string} args.language - 要设置的语言
     * @returns {Promise<Object>} 封装了设置成功信息的响应对象
     */
    async set_language(args: { language: string }): Promise<any> {
        try {
            const { language } = args;
            // 设置语言配置
            pub.C('language', language);
            // 记录日志
            logger.info(pub.lang('设置语言为: {}', language));

            // 定义需要清除的缓存键数组
            const cacheKeysToDelete = ['language', 'languages', 'lang_data', 'client_lang'];
            // 循环清除缓存
            cacheKeysToDelete.forEach(key => pub.cache_del(key));

            // 返回成功响应
            return pub.return_success(pub.lang('设置成功'), null);
        } catch (error) {
            // 记录错误日志
            logger.error(pub.lang('设置语言时出错:'), error);
            // 返回错误响应
            return pub.return_error(pub.lang('设置失败'), error);
        }
    }

    /**
     * 获取客户端语言包
     * @returns {Promise<Object>} 包含客户端语言包内容的对象，封装在成功响应中返回
     */
    async get_client_language(): Promise<any> {
        try {
            return this.getLanguagePack('client');
        } catch (error) {
            // 记录错误日志
            logger.error(pub.lang('获取客户端语言包时出错:'), error);
            // 返回错误响应
            return pub.return_error(pub.lang('获取客户端语言包失败'), error);
        }
    }

    /**
     * 获取服务端语言包
     * @returns {Promise<Object>} 包含服务端语言包内容的对象，封装在成功响应中返回
     */
    async get_server_language(): Promise<any> {
        try {
            return this.getLanguagePack('server');
        } catch (error) {
            // 记录错误日志
            logger.error(pub.lang('获取服务端语言包时出错:'), error);
            // 返回错误响应
            return pub.return_error(pub.lang('获取服务端语言包失败'), error);
        }
    }

    /**
     * 通用的获取语言包方法
     * @param {string} type - 语言包类型，如 'client' 或 'server'
     * @returns {Promise<Object>} 包含指定类型语言包内容的对象，封装在成功响应中返回
     */
    private async getLanguagePack(type: string): Promise<any> {
        // 获取当前语言
        const currentLanguage = pub.get_language();
        // 构建当前语言对应的语言包文件路径
        const languageFilePath = path.resolve(pub.get_language_path(), `${currentLanguage}/${type}.json`);

        // 检查文件是否存在，如果不存在则使用默认的中文语言包路径
        const filePath = pub.is_file(languageFilePath) ? languageFilePath : path.resolve(pub.get_language_path(), `zh/${type}.json`);
        // 读取文件内容
        let fileContent = pub.read_file(filePath);

        // 如果文件内容为空，设置为空对象
        if (!fileContent) {
            fileContent = '{}';
        }

        // 解析文件内容为 JSON 格式
        const languagePack = JSON.parse(fileContent);
        // 返回成功响应
        return pub.return_success(languagePack, null);
    }


}

/**
 * 重写 IndexController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
IndexController.toString = (): string => '[class IndexController]';

// 导出 IndexController 类的实例
export default new IndexController();