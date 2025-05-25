"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const public_1 = require("../class/public");
const path_1 = __importDefault(require("path"));
const model_1 = require("../service/model");
/**
 * model controller 类，用于管理模型供应端及模型相关的操作
 * @class
 */
class ModelController {
    // 模型资源根路径
    modelsPath;
    constructor() {
        this.modelsPath = path_1.default.resolve(public_1.pub.get_data_path(), "models");
    }
    // 封装文件读取和 JSON 解析操作
    async readJsonFile(filePath) {
        try {
            const fileContent = public_1.pub.read_file(filePath);
            return JSON.parse(fileContent);
        }
        catch (error) {
            console.error(`读取并解析文件 ${filePath} 时出错:`, error);
            throw new Error(public_1.pub.lang('文件读取或解析失败'));
        }
    }
    // 封装文件写入操作
    async writeJsonFile(filePath, data) {
        try {
            const jsonData = JSON.stringify(data, null, 4);
            public_1.pub.write_file(filePath, jsonData);
        }
        catch (error) {
            console.error(`写入文件 ${filePath} 时出错:`, error);
            throw new Error(public_1.pub.lang('文件写入失败'));
        }
    }
    // 统一返回结果处理
    handleResult(success, message, data) {
        if (success) {
            return public_1.pub.return_success(message, data);
        }
        else {
            return public_1.pub.return_error(message);
        }
    }
    // 获取供应商路径
    getSupplierPath(supplierName) {
        return path_1.default.resolve(this.modelsPath, supplierName);
    }
    // 获取供应商配置文件路径
    getSupplierConfigPath(supplierName) {
        return path_1.default.resolve(this.getSupplierPath(supplierName), "config.json");
    }
    // 获取模型文件路径
    getModelsFilePath(supplierName) {
        return path_1.default.resolve(this.getSupplierPath(supplierName), "models.json");
    }
    /**
     * 同步模型供应商模板信息
     * @returns
     */
    async sync_supplier_template() {
        const supplierTemplatesPath = path_1.default.resolve(public_1.pub.get_resource_path(), "models");
        if (!public_1.pub.file_exists(supplierTemplatesPath)) {
            return;
        }
        const supplierTemplates = public_1.pub.readdir(supplierTemplatesPath);
        const dstPath = this.modelsPath;
        if (!public_1.pub.file_exists(dstPath)) {
            public_1.pub.mkdir(dstPath);
        }
        for (const supplier of supplierTemplates) {
            let supplierName = path_1.default.basename(supplier);
            if (!supplierName) {
                continue;
            }
            let dstSupplierPath = path_1.default.resolve(dstPath, supplierName);
            if (!public_1.pub.file_exists(dstSupplierPath)) {
                public_1.pub.mkdir(dstSupplierPath);
            }
            let srcConfigFile = path_1.default.resolve(supplier, "config.json");
            let dstConfigFile = path_1.default.resolve(dstSupplierPath, "config.json");
            if (!public_1.pub.file_exists(dstConfigFile)) {
                public_1.pub.write_file(dstConfigFile, public_1.pub.read_file(srcConfigFile));
            }
            else {
                // 合并配置
                let srcConfigJson = await this.readJsonFile(srcConfigFile);
                let dstConfigJson = await this.readJsonFile(dstConfigFile);
                let isWrite = false;
                for (let key in srcConfigJson) {
                    // 忽略status, baseUrl, apiKey
                    if (key === "status" || key === 'baseUrl' || key === 'apiKey') {
                        continue;
                    }
                    if (!dstConfigJson[key] || dstConfigJson[key] !== srcConfigJson[key]) {
                        isWrite = true;
                        dstConfigJson[key] = srcConfigJson[key];
                    }
                }
                if (isWrite) {
                    await this.writeJsonFile(dstConfigFile, dstConfigJson);
                }
            }
            let srcModelsFile = path_1.default.resolve(supplier, "models.json");
            let dstModelsFile = path_1.default.resolve(dstSupplierPath, "models.json");
            if (!public_1.pub.file_exists(dstModelsFile)) {
                public_1.pub.write_file(dstModelsFile, public_1.pub.read_file(srcModelsFile));
            }
            else {
                // 合并配置
                let srcModels = await this.readJsonFile(srcModelsFile);
                let dstModels = await this.readJsonFile(dstModelsFile);
                let isWrite = false;
                for (let srcModel of srcModels) {
                    let isExist = false;
                    for (let dstModel of dstModels) {
                        if (dstModel.modelName === srcModel.modelName) {
                            isExist = true;
                        }
                    }
                    if (!isExist) {
                        isWrite = true;
                        dstModels.push(srcModel);
                    }
                }
                if (isWrite) {
                    await this.writeJsonFile(dstModelsFile, dstModels);
                }
            }
            let srcEmbeddingFile = path_1.default.resolve(supplier, "embedding.json");
            let dstEmbeddingFile = path_1.default.resolve(dstSupplierPath, "embedding.json");
            if (!public_1.pub.file_exists(dstEmbeddingFile)) {
                public_1.pub.write_file(dstEmbeddingFile, public_1.pub.read_file(srcEmbeddingFile));
            }
            else {
                // 合并配置
                let srcEmbedding = await this.readJsonFile(srcEmbeddingFile);
                let dstEmbedding = await this.readJsonFile(dstEmbeddingFile);
                let isWrite = false;
                for (let srcEmbed of srcEmbedding) {
                    let isExist = false;
                    for (let dstEmbed of dstEmbedding) {
                        if (dstEmbed.modelName === srcEmbed.modelName) {
                            isExist = true;
                        }
                    }
                    if (!isExist) {
                        isWrite = true;
                        dstEmbedding.push(srcEmbed);
                    }
                }
                if (isWrite) {
                    await this.writeJsonFile(dstEmbeddingFile, dstEmbedding);
                }
            }
        }
    }
    /**
     * 获取模型供应商列表
     * @param args
     * @returns
     */
    async get_supplier_list(args) {
        await this.sync_supplier_template();
        const suppliers = public_1.pub.readdir(this.modelsPath);
        const supplierList = [];
        for (const supplier of suppliers) {
            const configFile = this.getSupplierConfigPath(supplier);
            if (public_1.pub.file_exists(configFile)) {
                try {
                    const supplierInfo = await this.readJsonFile(configFile);
                    supplierList.push(supplierInfo);
                }
                catch (error) {
                    console.error(`获取供应商 ${supplier} 信息时出错:`, error);
                }
            }
        }
        // 根据sort字段排序
        supplierList.sort((a, b) => {
            return (a.sort || 0) - (b.sort || 0);
        });
        return this.handleResult(true, public_1.pub.lang('获取成功'), supplierList);
    }
    /**
     * 获取模型列表
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns
     */
    async get_models_list(args) {
        const supplierFile = this.getSupplierConfigPath(args.supplierName);
        const modelsFile = this.getModelsFilePath(args.supplierName);
        let supplierInfo;
        if (public_1.pub.file_exists(supplierFile)) {
            try {
                supplierInfo = await this.readJsonFile(supplierFile);
            }
            catch (error) {
                console.error(`获取供应商 ${args.supplierName} 信息时出错:`, error);
                return this.handleResult(false, public_1.pub.lang('获取供应商信息失败'));
            }
        }
        else {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        let models = [];
        if (public_1.pub.file_exists(modelsFile)) {
            try {
                models = await this.readJsonFile(modelsFile);
                for (const model of models) {
                    model.title = model.title || supplierInfo.supplierTitle + "/" + model.modelName;
                }
            }
            catch (error) {
                console.error(`获取模型列表时出错:`, error);
            }
        }
        // 获取嵌入模型
        let embeddingFile = path_1.default.resolve(this.getSupplierPath(args.supplierName), "embedding.json");
        if (public_1.pub.file_exists(embeddingFile)) {
            let embeddingModels = await this.readJsonFile(embeddingFile);
            for (let embeddingModel of embeddingModels) {
                let model = models.find((model) => model.modelName === embeddingModel.modelName);
                if (!model) {
                    embeddingModel.title = supplierInfo.supplierTitle + "/" + embeddingModel.modelName;
                    models.push(embeddingModel);
                }
            }
        }
        return this.handleResult(true, public_1.pub.lang('获取成功'), models);
    }
    /**
     * 添加模型
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.capability - 模型能力
     * @returns
     */
    async add_models(args) {
        try {
            const model = {
                title: args.title,
                modelName: args.modelName,
                supplierName: args.supplierName,
                capability: JSON.parse(args.capability),
                status: true
            };
            // 是否为嵌入模型
            let modelsFile = this.getModelsFilePath(args.supplierName);
            if (model.capability.find((c) => c === 'embedding')) {
                modelsFile = path_1.default.resolve(this.getSupplierPath(args.supplierName), "embedding.json");
            }
            // 检查模型是否已存在
            if (!public_1.pub.file_exists(modelsFile)) {
                let supplierPath = path_1.default.dirname(modelsFile);
                if (!public_1.pub.file_exists(supplierPath)) {
                    return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
                }
                public_1.pub.write_file(modelsFile, '[]');
            }
            const models = await this.readJsonFile(modelsFile);
            if (models.some((model) => model.modelName === args.modelName)) {
                return this.handleResult(false, public_1.pub.lang('模型已存在'));
            }
            models.push(model);
            await this.writeJsonFile(modelsFile, models);
            return this.handleResult(true, public_1.pub.lang('添加成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 删除模型
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @returns
     */
    async remove_models(args) {
        const modelsFile = this.getModelsFilePath(args.supplierName);
        if (!public_1.pub.file_exists(modelsFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const models = await this.readJsonFile(modelsFile);
            // 检查模型是否存在
            if (!models.some((model) => model.modelName === args.modelName)) {
                return this.handleResult(false, public_1.pub.lang('模型不存在'));
            }
            const newModels = models.filter((model) => model.modelName !== args.modelName);
            await this.writeJsonFile(modelsFile, newModels);
            return this.handleResult(true, public_1.pub.lang('删除成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 设置模型配置
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.baseUrl - 模型供应商接口地址
     * @param args.apiKey - 模型供应商接口密钥
     * @returns
     */
    async set_supplier_config(args) {
        const configFile = this.getSupplierConfigPath(args.supplierName);
        if (!public_1.pub.file_exists(configFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const supplierInfo = await this.readJsonFile(configFile);
            supplierInfo.baseUrl = args.baseUrl;
            supplierInfo.apiKey = args.apiKey;
            await this.writeJsonFile(configFile, supplierInfo);
            // 尝试获取在线模型列表
            await this.get_online_models({ supplierName: args.supplierName });
            return this.handleResult(true, public_1.pub.lang('设置成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 检查模型供应商API配置
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.baseUrl - 模型供应商接口地址
     * @param args.apiKey - 模型供应商接口密钥
     * @returns
     */
    async check_supplier_config(args) {
        const configFile = this.getSupplierConfigPath(args.supplierName);
        if (!public_1.pub.file_exists(configFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            return this.handleResult(true, public_1.pub.lang('API配置正确'));
        }
        catch (error) {
            return this.handleResult(false, public_1.pub.lang('连接失败，请检查') + ', ' + error.message);
        }
    }
    /**
     * 获取模型供应商API配置
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns
     */
    async get_supplier_config(args) {
        const configFile = this.getSupplierConfigPath(args.supplierName);
        if (!public_1.pub.file_exists(configFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const supplierInfo = await this.readJsonFile(configFile);
            return this.handleResult(true, public_1.pub.lang('获取成功'), supplierInfo);
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 设置模型服务商状态
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.status - 模型供应商状态
     * @returns
     */
    async set_supplier_status(args) {
        const configFile = this.getSupplierConfigPath(args.supplierName);
        if (!public_1.pub.file_exists(configFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const supplierInfo = await this.readJsonFile(configFile);
            supplierInfo.status = args.status === 'true';
            await this.writeJsonFile(configFile, supplierInfo);
            return this.handleResult(true, public_1.pub.lang('设置成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 设置指定模型状态
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称,多个用逗号分隔
     * @param args.status - 模型状态
     * @returns
     */
    async set_model_status(args) {
        const modelsFile = this.getModelsFilePath(args.supplierName);
        if (!public_1.pub.file_exists(modelsFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const models = await this.readJsonFile(modelsFile);
            let modelNameList = args.modelName.split(",");
            for (let modelName of modelNameList) {
                const model = models.find((model) => model.modelName === modelName);
                if (!model) {
                    continue;
                }
                model.status = args.status === 'true';
            }
            await this.writeJsonFile(modelsFile, models);
            // 修改嵌入模型状态
            let embeddingFile = path_1.default.resolve(this.getSupplierPath(args.supplierName), "embedding.json");
            if (public_1.pub.file_exists(embeddingFile)) {
                let embeddingModels = await this.readJsonFile(embeddingFile);
                for (let embeddingModel of embeddingModels) {
                    if (modelNameList.includes(embeddingModel.modelName)) {
                        embeddingModel.status = args.status === 'true';
                    }
                }
                await this.writeJsonFile(embeddingFile, embeddingModels);
            }
            return this.handleResult(true, public_1.pub.lang('设置成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 添加新的模型供应商
     * @param args
     * @param args.supplierName - 模型供应商名称(英文名)
     * @param args.supplierTitle - 模型供应商标题
     * @param args.baseUrl - 模型供应商接口地址
     * @param args.apiKey - 模型供应商接口密钥
     * @return {Promise<Result>} - 返回添加结果
     */
    async add_supplier(args) {
        const supplierPath = this.getSupplierPath(args.supplierName);
        const configFile = this.getSupplierConfigPath(args.supplierName);
        if (public_1.pub.file_exists(supplierPath) || public_1.pub.file_exists(configFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商已存在'));
        }
        try {
            const supplierInfo = {
                supplierTitle: args.supplierTitle,
                supplierName: args.supplierName,
                baseUrl: args.baseUrl,
                baseUrlExample: "",
                isUseUrlExample: false,
                apiKey: args.apiKey,
                home: "",
                help: "",
                status: true,
                sort: 9999,
                icon: "data:image/gif;base64,R0lGODlhGAAYAPecALq6us/PzwcHBzExMVZWVjQ0NDc3NyoqKvf397u7uwwMDPz8/M7OzlFRUUlJSevr6/b29k5OToSEhA8PD01NTTw8PDU1NeTk5BwcHAYGBnt7eykpKV1dXVhYWCMjI+Hh4efn5wsLC6Ojo0VFRbKysqKiom5ubu/v73h4eJmZmcXFxcLCwnNzc66urrGxsXJycre3t/r6+mFhYZiYmOXl5UhISAEBAVRUVHBwcKioqEJCQmVlZaurq1tbW+zs7NXV1d3d3ePj42xsbGlpac3NzWZmZkBAQJ2dnZubm1lZWX5+fj8/P/39/Ts7Oz4+PoGBgYaGhiQkJHR0dBkZGby8vCwsLHd3d4uLiw0NDRgYGBcXF46OjicnJ09PT319ffHx8aSkpK2trbCwsCsrKwkJCczMzMjIyLi4uNzc3FNTUwgICAoKCsnJyZycnKenpwQEBHl5eVVVVWRkZIqKiuDg4FpaWiIiInZ2dkxMTHx8fB4eHjY2NkRERJOTk5GRkcTExKmpqdTU1OLi4gMDAxMTE2hoaEpKSurq6pWVlRYWFvPz8z09PQICAvDw8MPDw7m5ucbGxoeHhyAgINPT05eXl3V1db+/vygoKKamppaWlqCgoAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMTQgNzkuMTUxNDgxLCAyMDEzLzAzLzEzLTEyOjA5OjE1ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjVjYzU4ZjlkLTU5MTctYWU0Ny05ZDM2LTJlZmVhNDE0M2FmOSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNUU5RDExMUZFNTgxMUVGQTY5NkFDNUQwMjVCNUVFNSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNUU5RDExMEZFNTgxMUVGQTY5NkFDNUQwMjVCNUVFNSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NWNjNThmOWQtNTkxNy1hZTQ3LTlkMzYtMmVmZWE0MTQzYWY5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjVjYzU4ZjlkLTU5MTctYWU0Ny05ZDM2LTJlZmVhNDE0M2FmOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAEAAJwALAAAAAAYABgAAAj/ADkJHMgphgYymzYdSECwoUNODARsStRhSUICnBRBeEjwQ0IqBI0kTIgBBkdOeDaVGXgozSYFHTQQYLRpiEMiETZxGMgioYwFBAls8kLQxMgcnFRIHHBBIJovAxdtoiPwxSYWLTYB4NRg0yOBIDZsIrRCIIBNczhN2mSIUwKtnAbc4MQEzqYGM9RsaoKA0yYHnAptCsSJBFwDOxwlHCFwgZyEVhtwshNCoOGtMhIiMpNhAgOBggok3MIpixaBLuDqmECwi0IaAsFsMsAp5wNOMDZl4mRh7sBIGGpsUiLQz6Y2YTZBEYhiU48NOwhKOcBJxKYSBWdzqrAJKScgHjZRwyBYYQynAJtmCLSwiVOJhE5uc/qjYNAPSBLHo08hcIANTs31kBAOAyWR0BVWFHDeJvydsAljQmyCAAIDbBKCGBLY4ABslXCx4BGc3LGJC5wgsQkPAp2hwCYZMMRJEG/ssSAgmGxSg0A+bKKgQI2ssBEnHCSkSVIj6UCQBJvU0VAfCfEh3xObeOCGQ0VssoYJlORxySZRsDFQjpKcxAMWI21SBVACXaDHJpacBBYDJwglQBw4iLaJCG461MIUIznwwUMBAQA7"
            };
            // 创建目录
            public_1.pub.mkdir(supplierPath);
            await this.writeJsonFile(configFile, supplierInfo);
            const modelsFile = this.getModelsFilePath(args.supplierName);
            await this.writeJsonFile(modelsFile, []);
            // 尝试获取在线模型列表
            await this.get_online_models({ supplierName: args.supplierName });
            return this.handleResult(true, public_1.pub.lang('添加成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 删除模型供应商
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns
     */
    async remove_supplier(args) {
        const supplierPath = this.getSupplierPath(args.supplierName);
        if (!public_1.pub.file_exists(supplierPath)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            public_1.pub.rmdir(supplierPath);
            return this.handleResult(true, public_1.pub.lang('删除成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 重新获取在线模型列表
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns {Promise<Result>}
     */
    async get_online_models(args) {
        let modelService = new model_1.ModelService(args.supplierName);
        let models = await modelService.getOnlineModels();
        if (!models) {
            console.error(modelService.error);
        }
        modelService.destroy();
        return this.handleResult(true, public_1.pub.lang('获取成功'), models);
    }
    /**
     * 设置模型标题
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.title - 模型标题
     * @return {Promise<Result>} - 返回设置结果
     */
    async set_model_title(args) {
        const modelsFile = this.getModelsFilePath(args.supplierName);
        if (!public_1.pub.file_exists(modelsFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const models = await this.readJsonFile(modelsFile);
            const model = models.find((model) => model.modelName === args.modelName);
            if (!model) {
                return this.handleResult(false, public_1.pub.lang('模型不存在'));
            }
            model.title = args.title;
            await this.writeJsonFile(modelsFile, models);
            return this.handleResult(true, public_1.pub.lang('设置成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 修改模型能力
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.capability - 模型能力
     * @return {Promise<Result>} - 返回修改结果
     */
    async set_model_capability(args) {
        const modelsFile = this.getModelsFilePath(args.supplierName);
        if (!public_1.pub.file_exists(modelsFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const models = await this.readJsonFile(modelsFile);
            const model = models.find((model) => model.modelName === args.modelName);
            if (!model) {
                return this.handleResult(false, public_1.pub.lang('模型不存在'));
            }
            model.capability = JSON.parse(args.capability);
            await this.writeJsonFile(modelsFile, models);
            return this.handleResult(true, public_1.pub.lang('修改成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
    /**
     * 修改模型信息
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.capability - 模型能力
     * @param args.title - 模型标题
     * @return {Promise<Result>} - 返回修改结果
     */
    async modify_model(args) {
        const modelsFile = this.getModelsFilePath(args.supplierName);
        if (!public_1.pub.file_exists(modelsFile)) {
            return this.handleResult(false, public_1.pub.lang('模型供应商不存在'));
        }
        try {
            const models = await this.readJsonFile(modelsFile);
            const model = models.find((model) => model.modelName === args.modelName);
            if (!model) {
                return this.handleResult(false, public_1.pub.lang('模型不存在'));
            }
            model.capability = JSON.parse(args.capability);
            model.title = args.title;
            await this.writeJsonFile(modelsFile, models);
            return this.handleResult(true, public_1.pub.lang('修改成功'));
        }
        catch (error) {
            return this.handleResult(false, error.message);
        }
    }
}
/**
 * 重写 ModelController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
ModelController.toString = () => '[class ModelController]';
exports.default = ModelController;
//# sourceMappingURL=model.js.map